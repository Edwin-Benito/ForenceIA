import type { Request, Response } from 'express';
import { analyzeIdentityDocument } from '../services/document.service.js';
import jwt from 'jsonwebtoken';

export const analyzeDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { message: "No se subió ningún documento." } });
      return;
    }

    const analysis = await analyzeIdentityDocument(req.file.buffer);

    // Firma del reporte (Calidad Factus)
    const reportToken = jwt.sign(
      { 
        sub: "forensic_report",
        data: analysis.personalInfo,
        security: analysis.forensicAnalysis 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: "success",
      message: "Análisis completado y firmado",
      reportToken,
      analysis
    });

  } catch (error: any) {
    res.status(500).json({
      error: {
        message: "Falla en el motor forense: " + error.message,
        code: "INTERNAL_AI_ERROR"
      }
    });
  }
};