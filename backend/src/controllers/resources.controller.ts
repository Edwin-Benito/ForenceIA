import type { Request, Response } from 'express';
import { MEXICAN_STATES, DOCUMENT_TYPES, VERDICT_STATUSES, ERROR_CODES } from '../lib/resources.js';
import type { ApiResponse } from '../types/api.types.js';

export const getStates = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const response: ApiResponse<typeof MEXICAN_STATES> = {
      status: 'success',
      code: 'STATES_RETRIEVED',
      message: 'Estados mexicanos obtenidos exitosamente',
      request_id: requestId,
      data: MEXICAN_STATES,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Estados obtenidos`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al obtener estados:`, error.message);
    res.status(500).json({
      status: 'error',
      code: 'STATES_RETRIEVAL_ERROR',
      message: error.message || 'Error al obtener estados',
      request_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getDocumentTypes = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const response: ApiResponse<typeof DOCUMENT_TYPES> = {
      status: 'success',
      code: 'DOCUMENT_TYPES_RETRIEVED',
      message: 'Tipos de documentos obtenidos exitosamente',
      request_id: requestId,
      data: DOCUMENT_TYPES,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Tipos de documento obtenidos`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al obtener tipos de documento:`, error.message);
    res.status(500).json({
      status: 'error',
      code: 'DOCUMENT_TYPES_RETRIEVAL_ERROR',
      message: error.message || 'Error al obtener tipos de documento',
      request_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getVerdicts = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const response: ApiResponse<typeof VERDICT_STATUSES> = {
      status: 'success',
      code: 'VERDICTS_RETRIEVED',
      message: 'Estados de veredicto obtenidos exitosamente',
      request_id: requestId,
      data: VERDICT_STATUSES,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Veredictos obtenidos`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al obtener veredictos:`, error.message);
    res.status(500).json({
      status: 'error',
      code: 'VERDICTS_RETRIEVAL_ERROR',
      message: error.message || 'Error al obtener veredictos',
      request_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getErrorCodes = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Opcionalmente filtrar por categoría
    const category = (req.query.category as string) || null;
    
    let filteredErrors = ERROR_CODES;
    if (category) {
      filteredErrors = ERROR_CODES.filter(error => error.category === category);
    }

    const response: ApiResponse<typeof filteredErrors> = {
      status: 'success',
      code: 'ERROR_CODES_RETRIEVED',
      message: 'Códigos de error obtenidos exitosamente',
      request_id: requestId,
      data: filteredErrors,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Códigos de error obtenidos`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al obtener códigos de error:`, error.message);
    res.status(500).json({
      status: 'error',
      code: 'ERROR_CODES_RETRIEVAL_ERROR',
      message: error.message || 'Error al obtener códigos de error',
      request_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};
