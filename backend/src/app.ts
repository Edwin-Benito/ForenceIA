import './env.config.js';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import auditRoutes from './routes/audit.routes.js';
import sessionRoutes from './routes/session.routes.js';
import resourceRoutes from './routes/resources.routes.js';
import { analyzeIdentityDocument } from './services/document.service.js';
import { validateApiKey } from './middlewares/apiKeyValidator.js';
import type { ApiResponse, ApiError } from './types/api.types.js';

const app = express();
const upload = multer();

// Cargar especificación OpenAPI
const swaggerFilePath = path.join(process.cwd(), 'docs', 'swagger.yaml');
const swaggerFile = fs.readFileSync(swaggerFilePath, 'utf8');
const swaggerSpec = YAML.parse(swaggerFile);

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    tryItOutEnabled: true,
    persistAuthorization: true,
  }
}));

console.log('📖 Documentación disponible en http://localhost:4000/api-docs');

const routerV1 = express.Router();

// Middleware de autenticación
routerV1.use(validateApiKey);

// Health check endpoint (sin autenticación)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de Análisis
routerV1.post('/documents/analyze', upload.single('document'), async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    if (!req.file) {
      const error: ApiError = {
        status: 'error',
        code: 'MISSING_DOCUMENT',
        message: 'No se proporcionó archivo de documento.',
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(error);
    }

    console.log(`📨 [${requestId}] Análisis de: ${req.file.originalname}`);
    const analysis = await analyzeIdentityDocument(req.file.buffer);
    
    const response: ApiResponse<any> = {
      status: 'success',
      code: 'DOCUMENT_ANALYZED',
      message: 'Documento analizado exitosamente',
      request_id: requestId,
      data: analysis,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ [${requestId}] Análisis completado`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error:`, error.message);
    
    const response: ApiError = {
      status: 'error',
      code: 'ANALYSIS_FAILED',
      message: error.message || 'Error al analizar documento',
      request_id: requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

// Ruta de Historial
routerV1.use('/audits', auditRoutes);

// Ruta de Sesiones
routerV1.use('/sessions', sessionRoutes);

// Ruta de Recursos (sin autenticación para facilitar acceso a catálogos)
const resourceRouter = express.Router();
resourceRouter.use(resourceRoutes);
app.use('/api/v1/resources', resourceRouter);

app.use('/api/v1', routerV1);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🛡️ ForenseID activo en puerto ${PORT}`);
});