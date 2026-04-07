import type { Request, Response, NextFunction } from 'express';
export declare const validateApiKey: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware para rutas públicas que NO requieren API Key
 * (ej: /api-docs, /health, /auth/token)
 */
export declare const publicRoute: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Generar ID único para cada solicitud (para auditoría)
 */
export declare const generateRequestId: () => string;
//# sourceMappingURL=apiKeyValidator.d.ts.map