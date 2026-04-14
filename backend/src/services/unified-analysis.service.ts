import { analyzeIdentityDocument } from './document.service.js';
import { analyzeIdentityDocumentFree } from './document-free.service.js';
import { detectFacesWithFaceApi, type FaceApiResult } from './face-api.service.js';
import { prisma } from '../lib/prisma.js';

type StageResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: { code: string; message: string } };

export type UnifiedAnalysis = {
  personalInfo: {
    fullName: string;
    idNumber: string;
    curp: string;
    documentType?: string;
    extractionConfidence?: number;
  };
  forensicAnalysis: {
    faceDetected: boolean;
    faceConfidence: number;
    isSpecimen: boolean;
    isDigitallyAltered: boolean;
    verdict: { status: 'VERDADERO' | 'FALSO' | 'SOSPECHOSO'; message: string; color: string };
    stages: {
      ocr: StageResult<any>;
      face_api: StageResult<FaceApiResult>;
      cloud: StageResult<any>;
    };
  };
  engine: string;
};

const normalizeVerdict = (
  status: string | undefined,
  message: string | undefined,
  color: string | undefined
): UnifiedAnalysis['forensicAnalysis']['verdict'] => {
  const s = (status || '').toUpperCase();

  if (s === 'VERDADERO' || s === 'TRUE' || s === 'ACCEPTED' || s === 'ACEPTADO') {
    return { status: 'VERDADERO', message: message || 'Documento auténtico.', color: 'emerald' };
  }

  if (s === 'SOSPECHOSO' || s === 'SUSPICIOUS') {
    return { status: 'SOSPECHOSO', message: message || 'Revisión manual requerida.', color: 'amber' };
  }

  if (s === 'FALSO' || s === 'FALSE' || s === 'RECHAZADO' || s === 'REJECTED') {
    return { status: 'FALSO', message: message || 'Documento no válido.', color: 'red' };
  }

  // Fallback
  const c = (color || '').toLowerCase();
  if (c.includes('emerald') || c.includes('green')) {
    return { status: 'VERDADERO', message: message || 'Documento auténtico.', color: 'emerald' };
  }
  if (c.includes('amber') || c.includes('orange') || c.includes('yellow')) {
    return { status: 'SOSPECHOSO', message: message || 'Revisión manual requerida.', color: 'amber' };
  }
  if (c.includes('red')) {
    return { status: 'FALSO', message: message || 'Documento no válido.', color: 'red' };
  }

  return { status: 'SOSPECHOSO', message: message || 'Resultado indeterminado.', color: 'amber' };
};

export const analyzeUnifiedDocument = async (imageBuffer: Buffer): Promise<UnifiedAnalysis> => {
  // Ejecutar en paralelo, pero sin romper todo si una etapa falla.
  const [ocrSettled, faceSettled, cloudSettled] = await Promise.allSettled([
    analyzeIdentityDocumentFree(imageBuffer, { saveAudit: false }),
    detectFacesWithFaceApi(imageBuffer),
    analyzeIdentityDocument(imageBuffer, { saveAudit: false, allowSimulatedFallback: false })
  ]);

  const ocrStage: StageResult<any> =
    ocrSettled.status === 'fulfilled'
      ? { ok: true, result: ocrSettled.value }
      : { ok: false, error: { code: 'OCR_FAILED', message: String(ocrSettled.reason?.message || ocrSettled.reason) } };

  const faceStage: StageResult<FaceApiResult> =
    faceSettled.status === 'fulfilled'
      ? { ok: true, result: faceSettled.value }
      : { ok: false, error: { code: 'FACE_API_FAILED', message: String(faceSettled.reason?.message || faceSettled.reason) } };

  const cloudStage: StageResult<any> =
    cloudSettled.status === 'fulfilled'
      ? { ok: true, result: cloudSettled.value }
      : { ok: false, error: { code: 'CLOUD_FAILED', message: String(cloudSettled.reason?.message || cloudSettled.reason) } };

  const ocrAnalysis = ocrStage.ok ? ocrStage.result : null;
  const cloudAnalysis = cloudStage.ok ? cloudStage.result : null;
  const faceApi = faceStage.ok ? faceStage.result : null;

  const cloudIsSimulated = Boolean(
    cloudStage.ok &&
      String(cloudAnalysis?.forensicAnalysis?.verdict?.status || '').toUpperCase() === 'SIMULATED_DATA'
  );

  // Personal info: preferir OCR; usar Cloud solo si es real y rellena campos faltantes.
  const personalInfo = {
    fullName: ocrAnalysis?.personalInfo?.fullName || 'IDENTIDAD DESCONOCIDA',
    idNumber: ocrAnalysis?.personalInfo?.idNumber || 'N/A',
    curp: ocrAnalysis?.personalInfo?.curp || 'N/A',
    documentType: ocrAnalysis?.personalInfo?.documentType || cloudAnalysis?.personalInfo?.documentType,
    extractionConfidence: ocrAnalysis?.personalInfo?.extractionConfidence
  };

  if (cloudStage.ok && !cloudIsSimulated && cloudAnalysis?.personalInfo) {
    if (personalInfo.fullName === 'IDENTIDAD DESCONOCIDA' && cloudAnalysis.personalInfo.fullName) {
      personalInfo.fullName = cloudAnalysis.personalInfo.fullName;
    }
    if ((personalInfo.idNumber === 'N/A' || !personalInfo.idNumber) && cloudAnalysis.personalInfo.idNumber) {
      personalInfo.idNumber = cloudAnalysis.personalInfo.idNumber;
    }
    if ((personalInfo.curp === 'N/A' || !personalInfo.curp) && cloudAnalysis.personalInfo.curp) {
      personalInfo.curp = cloudAnalysis.personalInfo.curp;
    }
  }

  const isSpecimen = Boolean(cloudAnalysis?.forensicAnalysis?.isSpecimen || ocrAnalysis?.forensicAnalysis?.isSpecimen);
  const isDigitallyAltered = Boolean(cloudAnalysis?.forensicAnalysis?.isDigitallyAltered || ocrAnalysis?.forensicAnalysis?.isDigitallyAltered);

  const faceConfidence = Number(
    Math.max(
      cloudAnalysis?.faceConfidence || cloudAnalysis?.forensicAnalysis?.faceConfidence || 0,
      ocrAnalysis?.forensicAnalysis?.confidence ? (ocrAnalysis.forensicAnalysis.confidence / 100) : 0,
      faceApi?.confidence || 0
    ).toFixed(4)
  );
  const faceDetected = Boolean(
    (faceApi?.ok && faceApi.facesDetected) ||
      cloudAnalysis?.forensicAnalysis?.faceDetected ||
      ocrAnalysis?.forensicAnalysis?.faceDetected
  );

  // Veredicto agregado: si specimen => FALSO; si digital alterado => FALSO; si no rostro => SOSPECHOSO; si identidad desconocida => SOSPECHOSO; si cloud dice VERDADERO => VERDADERO.
  const cloudVerdict = cloudAnalysis?.forensicAnalysis?.verdict;
  const ocrVerdict = ocrAnalysis?.forensicAnalysis?.verdict;

  let verdict = normalizeVerdict(cloudVerdict?.status, cloudVerdict?.message, cloudVerdict?.color);
  if ((!cloudStage.ok || cloudIsSimulated) && ocrVerdict) {
    verdict = normalizeVerdict(ocrVerdict.status, ocrVerdict.message, (ocrVerdict as any).color);
  }

  if (isSpecimen) {
    verdict = { status: 'FALSO', message: 'Documento marcado como espécimen/muestra.', color: 'red' };
  } else if (isDigitallyAltered) {
    verdict = { status: 'FALSO', message: 'Integridad digital comprometida.', color: 'red' };
  } else if (!faceDetected) {
    verdict = { status: 'SOSPECHOSO', message: 'Biometría facial insuficiente o no detectada.', color: 'amber' };
  } else if (personalInfo.fullName === 'IDENTIDAD DESCONOCIDA') {
    verdict = { status: 'SOSPECHOSO', message: 'No se pudo extraer identidad con claridad.', color: 'amber' };
  }

  // Guardar una sola auditoría (unificada)
  try {
    await prisma.audit.create({
      data: {
        fullName: personalInfo.fullName,
        documentId: personalInfo.idNumber,
        curp: personalInfo.curp || null,
        faceConfidence,
        isDigitallyAltered,
        isSpecimen,
        verdictStatus: verdict.status,
        verdictMessage: verdict.message,
        documentOrigin: isSpecimen ? 'SPECIMEN' : 'OFICIAL',
        engineVersion: 'ForenseID Unified v1 (Tesseract + Face-API + Google Cloud)'
      }
    });
  } catch {
    // no crítico
  }

  return {
    personalInfo,
    forensicAnalysis: {
      faceDetected,
      faceConfidence,
      isSpecimen,
      isDigitallyAltered,
      verdict,
      stages: {
        ocr: ocrStage,
        face_api: faceStage,
        cloud: cloudStage
      }
    },
    engine: 'Tesseract.js + Face-API + Google Cloud (Unified)'
  };
};
