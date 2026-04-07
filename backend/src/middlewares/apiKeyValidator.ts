import type { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../types/api.types.js';

/**
 * Middleware para validación de API Key
 * Las keys pueden venir en:
 * 1. Header: Authorization: Bearer <token>
 * 2. Query: ?api_key=<key>
 * 3. Body: { api_key: "<key>" }
 */

// Simulación de BD de API Keys válidas (en producción, usar BD real)
const VALID_API_KEYS = new Set([
  'forenseid_demo_key_2026',
  'forenseid_test_sandbox',
  process.env.API_KEY || 'forenseid_demo_key_2026'
]);

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Extraer key de diferentes fuentes
  let apiKey: string | null = null;

  // 1. Desde Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  // 2. Desde query parameter
  if (!apiKey && req.query.api_key) {
    apiKey = req.query.api_key as string;
  }

  // 3. Desde body (para POSTs)
  if (!apiKey && (req.body as any)?.api_key) {
    apiKey = (req.body as any).api_key;
  }

  // Si no hay key, rechazar
  if (!apiKey) {
    console.warn('❌ API Key missing from request');
    const response: ApiError = {
      status: 'error',
      code: 'MISSING_API_KEY',
      message: 'API Key is required. Use Authorization: Bearer <key> or ?api_key=<key>',
      request_id: generateRequestId(),
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Validar que la key sea válida
  if (!VALID_API_KEYS.has(apiKey)) {
    console.warn(`❌ Invalid API Key: ${apiKey.substring(0, 10)}...`);
    const response: ApiError = {
      status: 'error',
      code: 'INVALID_API_KEY',
      message: 'The provided API Key is invalid or has been revoked.',
      request_id: generateRequestId(),
      timestamp: new Date().toISOString()
    };
    return res.status(403).json(response);
  }

  // ✅ Key válida, continuar
  console.log(`✅ API Key validated: ${apiKey.substring(0, 10)}...`);
  (req as any).apiKey = apiKey;
  (req as any).requestId = generateRequestId();
  next();
};

/**
 * Middleware para rutas públicas que NO requieren API Key
 * (ej: /api-docs, /health, /auth/token)
 */
export const publicRoute = (req: Request, res: Response, next: NextFunction) => {
  (req as any).requestId = generateRequestId();
  next();
};

/**
 * Generar ID único para cada solicitud (para auditoría)
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
