import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { analyzeUnifiedDocument } from '../services/unified-analysis.service.js';
import { generateRequestId } from '../middlewares/apiKeyValidator.js';

export const analyzeDocumentUnified = async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId || generateRequestId();

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        code: 'NO_FILE',
        message: 'No se subió ningún documento.',
        request_id: requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const analysis = await analyzeUnifiedDocument(req.file.buffer);

    const reportToken = jwt.sign(
      {
        sub: 'forensic_report',
        data: analysis.personalInfo,
        security: analysis.forensicAnalysis,
        engine: analysis.engine
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: 'success',
      code: 'UNIFIED_ANALYSIS_COMPLETE',
      message: 'Análisis unificado completado',
      engine: analysis.engine,
      request_id: requestId,
      data: analysis,
      timestamp: new Date().toISOString(),
      reportToken
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      code: 'UNIFIED_ANALYSIS_ERROR',
      message: 'Error en análisis unificado: ' + error.message,
      engine: 'Unified',
      request_id: (req as any).requestId || generateRequestId(),
      timestamp: new Date().toISOString()
    });
  }
};
