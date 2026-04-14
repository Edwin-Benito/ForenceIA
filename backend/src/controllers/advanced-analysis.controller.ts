import type { Request, Response } from 'express';
import { analyzeIdentityDocumentFree } from '../services/document-free.service.js';
import { completeAnalysis } from '../services/advanced-analysis.service.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { generateRequestId } from '../middlewares/apiKeyValidator.js';

export const analyzeDocumentAdvanced = async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId || generateRequestId();
    if (!req.file) {
      res.status(400).json({
        status: "error",
        code: "NO_FILE",
        message: "No se subió ningún documento."
      });
      return;
    }

    console.log(`\n🔍 [ANÁLISIS AVANZADO] Procesando documento: ${req.file.originalname}`);

    // Paso 1: OCR con Tesseract
    console.log('📄 [PASO 1] Extrayendo texto con Tesseract.js...');
    const ocrResult = await analyzeIdentityDocumentFree(req.file.buffer);

    // Paso 2: Análisis avanzado con Face-api.js + Cloudinary
    console.log('🔬 [PASO 2] Realizando análisis avanzado (Face-api + Cloudinary)...');
    const advancedResult = await completeAnalysis(
      req.file.buffer,
      ocrResult.forensicAnalysis?.textExtracted || '',
      req.file.originalname
    );

    // Combinamos resultados
    const combinedAnalysis = {
      personalInfo: ocrResult.personalInfo,
      forensicAnalysis: {
        ...ocrResult.forensicAnalysis,
        ...advancedResult,
        authenticityScore: advancedResult.authenticityScore,
        verdictFinal: advancedResult.verdict
      },
      engine: "Tesseract + Face-api.js + Cloudinary (100% GRATUITO)"
    };

    // Firma del reporte
    const reportToken = jwt.sign(
      {
        sub: "forensic_report",
        data: combinedAnalysis.personalInfo,
        security: combinedAnalysis.forensicAnalysis,
        engine: combinedAnalysis.engine
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Almacenar en base de datos para auditoría (sin esperar)
    try {
      const verdict = advancedResult.verdict;
      const verdictStatus = typeof verdict === 'object' ? verdict.status : 'UNKNOWN';
      const verdictMessage = typeof verdict === 'object' ? verdict.message : '';
      
      await prisma.audit.create({
        data: {
          fullName: ocrResult.personalInfo?.fullName || 'UNKNOWN',
          documentId: ocrResult.personalInfo?.idNumber || req.file.originalname,
          curp: ocrResult.personalInfo?.curp,
          faceConfidence: advancedResult.advancedAnalysis?.faceAnalysis?.confidence || 0,
          isDigitallyAltered: false,
          isSpecimen: false,
          verdictStatus: verdictStatus,
          verdictMessage: verdictMessage,
          engineVersion: "ForenseID v8.0 (Tesseract + Face-api + Cloudinary FREE)"
        }
      });
      console.log('✅ [AUDITORÍA] Análisis almacenado en base de datos');
    } catch (dbError: any) {
      console.warn('⚠️ [AUDITORÍA] Error al almacenar (no crítico):', dbError.message);
    }

    // Respuesta exitosa
    res.status(200).json({
      status: 'success',
      code: 'ADVANCED_ANALYSIS_COMPLETE',
      message: 'Análisis avanzado completado exitosamente',
      engine: combinedAnalysis.engine,
      request_id: requestId,
      data: combinedAnalysis,
      timestamp: new Date().toISOString(),
      reportToken
    });

  } catch (error: any) {
    console.error('❌ [ERROR ANÁLISIS AVANZADO]', error);
    res.status(500).json({
      status: "error",
      code: "ADVANCED_ANALYSIS_ERROR",
      message: "Error en análisis avanzado: " + error.message,
      engine: "Tesseract + Face-api.js + Cloudinary",
      request_id: (req as any).requestId || generateRequestId(),
      timestamp: new Date().toISOString()
    });
  }
};
