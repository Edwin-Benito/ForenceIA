import { Router } from 'express';
import { getStates, getDocumentTypes, getVerdicts, getErrorCodes } from '../controllers/resources.controller.js';

const router = Router();

/**
 * GET /api/v1/resources/states
 * Obtener lista de estados mexicanos
 */
router.get('/states', getStates);

/**
 * GET /api/v1/resources/document-types
 * Obtener lista de tipos de documentos
 */
router.get('/document-types', getDocumentTypes);

/**
 * GET /api/v1/resources/verdicts
 * Obtener lista de estados de veredicto
 */
router.get('/verdicts', getVerdicts);

/**
 * GET /api/v1/resources/error-codes
 * Obtener lista de códigos de error (con filtro opcional por categoría)
 * Query params: ?category=authentication|validation|processing|database|resource|rate-limit
 */
router.get('/error-codes', getErrorCodes);

export default router;
