import path from 'path';
import sharp from 'sharp';

export type FaceApiDetection = {
  score: number;
  box: { x: number; y: number; width: number; height: number };
};

export type FaceApiResult = {
  ok: boolean;
  engine: 'face-api';
  facesDetected: boolean;
  faceCount: number;
  confidence: number;
  detections: FaceApiDetection[];
  model: 'tiny_face_detector';
  areaRatio?: number;
  textureScore?: number;
  isLikelyIllustration?: boolean;
  warnings?: string[];
  error?: { code: string; message: string };
};

let modelsLoaded = false;
let loadPromise: Promise<void> | null = null;

const getModelsDir = () => path.resolve(process.cwd(), 'models', 'face-api');

const ensureDepsAndLoadModels = async () => {
  if (modelsLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Inicializar TensorFlow.js con backend WASM (compatible con Node 24).
    await import('@tensorflow/tfjs-backend-wasm');
    const tfModule = await import('@tensorflow/tfjs');
    const tf = (tfModule as any).default ?? (tfModule as any);
    if (tf?.setBackend) {
      await tf.setBackend('wasm');
    }
    if (tf?.ready) {
      await tf.ready();
    }

    const faceapiModule = await import('@vladmandic/face-api/dist/face-api.node-wasm.js');
    const faceapi = (faceapiModule as any).default ?? (faceapiModule as any);

    const canvasModule = await import('canvas');
    const { Canvas, Image, ImageData } = canvasModule as any;

    if (!faceapi?.env?.monkeyPatch) {
      throw new Error('Face-API no disponible en este runtime');
    }

    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

    const modelsDir = getModelsDir();
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelsDir);

    modelsLoaded = true;
  })();

  return loadPromise;
};

export const detectFacesWithFaceApi = async (imageBuffer: Buffer): Promise<FaceApiResult> => {
  try {
    await ensureDepsAndLoadModels();

    const faceapiModule = await import('@vladmandic/face-api/dist/face-api.node-wasm.js');
    const faceapi = (faceapiModule as any).default ?? (faceapiModule as any);

    const canvasModule = await import('canvas');
    const { loadImage } = canvasModule as any;

    let bufferForFaceApi: Buffer = imageBuffer;
    let img: any;
    try {
      img = await loadImage(bufferForFaceApi);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : '';
      // En algunos JPGs (p.ej. progressive o con subsampling raro) canvas puede fallar.
      // Convertimos a PNG y reintentamos.
      if (msg.toLowerCase().includes('unsupported image type') || msg.toLowerCase().includes('invalid')) {
        bufferForFaceApi = await sharp(imageBuffer).png().toBuffer();
        img = await loadImage(bufferForFaceApi);
      } else {
        throw e;
      }
    }

    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.55 })
    );

    const mapped: FaceApiDetection[] = (detections || []).map((d: any) => ({
      score: Number(d.score || 0),
      box: {
        x: Number(d.box?.x || 0),
        y: Number(d.box?.y || 0),
        width: Number(d.box?.width || 0),
        height: Number(d.box?.height || 0)
      }
    }));

    const confidence = mapped.length
      ? Math.max(...mapped.map((d) => d.score))
      : 0;

    // Heurística anti-falsos-positivos: descartar "rostros" con textura muy baja (siluetas / iconos).
    let areaRatio: number | undefined;
    let textureScore: number | undefined;
    let isLikelyIllustration: boolean | undefined;
    const warnings: string[] = [];

    if (mapped.length) {
      const best = mapped.reduce((a, b) => (b.score > a.score ? b : a));
      const meta = await sharp(bufferForFaceApi).metadata();
      const width = meta.width || 0;
      const height = meta.height || 0;

      if (width > 0 && height > 0) {
        const faceArea = Math.max(0, best.box.width) * Math.max(0, best.box.height);
        areaRatio = faceArea / (width * height);

        // Recortar rostro con padding para analizar textura.
        const pad = 0.08;
        const left = Math.max(0, Math.floor(best.box.x - best.box.width * pad));
        const top = Math.max(0, Math.floor(best.box.y - best.box.height * pad));
        const right = Math.min(width, Math.ceil(best.box.x + best.box.width * (1 + pad)));
        const bottom = Math.min(height, Math.ceil(best.box.y + best.box.height * (1 + pad)));
        const cropW = Math.max(1, right - left);
        const cropH = Math.max(1, bottom - top);

        const raw = await sharp(bufferForFaceApi)
          .extract({ left, top, width: cropW, height: cropH })
          .resize(64, 64, { fit: 'fill' })
          .grayscale()
          .raw()
          .toBuffer();

        // Stddev simple como proxy de detalle/texture. Bajo => plano (icono/silueta).
        let sum = 0;
        for (let i = 0; i < raw.length; i++) sum += raw[i] ?? 0;
        const mean = sum / raw.length;
        let varSum = 0;
        for (let i = 0; i < raw.length; i++) {
          const d = (raw[i] ?? 0) - mean;
          varSum += d * d;
        }
        const std = Math.sqrt(varSum / raw.length);
        textureScore = Number(std.toFixed(2));

        // Umbrales conservadores: baja textura o rostro demasiado grande/pequeño suele ser falso positivo.
        const tooFlat = std < 10; // iconos/siluetas tienden a baja varianza
        const tooSmall = areaRatio < 0.01;
        const tooBig = areaRatio > 0.35;
        isLikelyIllustration = tooFlat || tooSmall || tooBig;
        if (isLikelyIllustration) {
          warnings.push('Detección facial descartada por baja textura o tamaño anómalo (posible silueta/ilustración).');
        }
      }
    }

    const result: FaceApiResult = {
      ok: true,
      engine: 'face-api',
      facesDetected: mapped.length > 0 && !isLikelyIllustration,
      faceCount: mapped.length,
      confidence: Number(confidence.toFixed(4)),
      detections: mapped,
      model: 'tiny_face_detector'
    };

    if (areaRatio !== undefined) {
      result.areaRatio = areaRatio;
    }
    if (textureScore !== undefined) {
      result.textureScore = textureScore;
    }
    if (isLikelyIllustration !== undefined) {
      result.isLikelyIllustration = isLikelyIllustration;
    }
    if (warnings.length) {
      result.warnings = warnings;
    }

    return result;
  } catch (error: any) {
    const message = error?.message ? String(error.message) : 'Error desconocido en Face-API';

    // Errores típicos: dependencias faltantes o modelos no descargados.
    const hint = message.includes('loadFromDisk') || message.includes('ENOENT')
      ? 'Modelos no encontrados: coloca los modelos en backend/models/face-api'
      : message.includes('tfjs-node')
        ? 'Falta dependencia @tensorflow/tfjs-node'
        : undefined;

    const base: FaceApiResult = {
      ok: false,
      engine: 'face-api',
      facesDetected: false,
      faceCount: 0,
      confidence: 0,
      detections: [],
      model: 'tiny_face_detector',
      error: { code: 'FACE_API_UNAVAILABLE', message }
    };

    if (hint) {
      base.warnings = [hint];
    }

    return base;
  }
};
