import type { Request, Response } from 'express';
import { analyzeIdentityDocumentFree } from '../services/document-free.service.js';
import jwt from 'jsonwebtoken';
import { generateRequestId } from '../middlewares/apiKeyValidator.js';

/**
 * Análisis SIMPLE y GRATUITO con Tesseract OCR
 * Usa solo Open Source, sin APIs externas
 */
export const analyzeDocumentFree = async (req: Request, res: Response) => {
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

    console.log(`\n✅ [ANÁLISIS GRATUITO] Procesando con Tesseract.js: ${req.file.originalname}`);

    // Usar solo Tesseract para análisis
    const analysis = await analyzeIdentityDocumentFree(req.file.buffer);

    // Firma del reporte
    const reportToken = jwt.sign(
      {
        sub: "forensic_report",
        data: analysis.personalInfo,
        security: analysis.forensicAnalysis,
        engine: "Tesseract.js (100% GRATUITO)"
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Respuesta exitosa
    res.status(200).json({
      status: 'success',
      code: 'FREE_ANALYSIS_COMPLETE',
      message: 'Análisis GRATUITO con Tesseract completado',
      engine: 'Tesseract.js OCR (100% GRATUITO - Open Source)',
      request_id: requestId,
      data: analysis,
      timestamp: new Date().toISOString(),
      reportToken
    });

  } catch (error: any) {
    console.error('❌ [ERROR ANÁLISIS GRATUITO]', error);
    res.status(500).json({
      status: "error",
      code: "FREE_ANALYSIS_ERROR",
      message: "Error en análisis: " + error.message,
      engine: "Tesseract.js",
      request_id: (req as any).requestId || generateRequestId(),
      timestamp: new Date().toISOString()
    });
  }
};
