import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const fileSchema = z.object({
  // Usamos .refine para evitar problemas de versiones con z.enum
  mimetype: z.string().refine(
    (val) => ACCEPTED_MIME_TYPES.includes(val),
    { message: 'Formato no válido. Solo se permiten imágenes JPEG, PNG o WEBP.' }
  ),
  size: z.number().max(5 * 1024 * 1024, { 
    message: 'El archivo es demasiado pesado (Máximo 5MB).' 
  })
});

export const validateDocument = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No se adjuntó ningún documento para analizar.', 400, 'MISSING_DOCUMENT');
    }

    fileSchema.parse({
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Archivo no válido';
      next(new AppError(errorMessage, 400, 'INVALID_DOCUMENT_FORMAT'));
    } else {
      next(error);
    }
  }
};