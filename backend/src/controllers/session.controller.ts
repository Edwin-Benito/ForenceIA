import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { ApiResponse, ApiError, SessionRecord, CreateSessionRequest, UpdateSessionRequest } from '../types/api.types.js';

export const createSession = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { userId, durationMinutes = 30 } = req.body as CreateSessionRequest;

    if (!userId) {
      const error: ApiError = {
        status: 'error',
        code: 'MISSING_USER_ID',
        message: 'userId es requerido',
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(error);
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    
    const session = await prisma.session.create({
      data: {
        userId,
        status: 'ACTIVE',
        expiresAt
      }
    });

    const response: ApiResponse<SessionRecord> = {
      status: 'success',
      code: 'SESSION_CREATED',
      message: 'Sesión creada exitosamente',
      request_id: requestId,
      data: session as unknown as SessionRecord,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Sesión creada: ${session.id}`);
    res.status(201).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al crear sesión:`, error.message);
    
    const response: ApiError = {
      status: 'error',
      code: 'SESSION_CREATE_ERROR',
      message: error.message || 'Error al crear sesión',
      request_id: requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

export const getSession = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id as string }
    });

    if (!session) {
      const error: ApiError = {
        status: 'error',
        code: 'SESSION_NOT_FOUND',
        message: `Sesión no encontrada: ${req.params.id}`,
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(error);
    }

    // Verificar si la sesión ha expirado
    if (new Date() > session.expiresAt && session.status === 'ACTIVE') {
      await prisma.session.update({
        where: { id: session.id },
        data: { status: 'EXPIRED' }
      });
      session.status = 'EXPIRED';
    }

    const response: ApiResponse<SessionRecord> = {
      status: 'success',
      code: 'SESSION_RETRIEVED',
      message: 'Sesión recuperada',
      request_id: requestId,
      data: session as unknown as SessionRecord,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al obtener sesión:`, error.message);
    
    const response: ApiError = {
      status: 'error',
      code: 'SESSION_ERROR',
      message: error.message || 'Error al obtener sesión',
      request_id: requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

export const updateSession = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { status, documentId, result, notes } = req.body as UpdateSessionRequest;

    const session = await prisma.session.findUnique({
      where: { id: req.params.id as string }
    });

    if (!session) {
      const error: ApiError = {
        status: 'error',
        code: 'SESSION_NOT_FOUND',
        message: `Sesión no encontrada: ${req.params.id}`,
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(error);
    }

    // Preparar datos a actualizar
    const updateData: any = {};
    if (status) updateData.status = status;
    if (documentId) updateData.documentId = documentId;
    if (result) updateData.result = result;
    if (notes) updateData.notes = notes;
    
    // Si el estado es COMPLETED, registrar fecha de finalización
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.session.update({
      where: { id: session.id },
      data: updateData
    });

    const response: ApiResponse<SessionRecord> = {
      status: 'success',
      code: 'SESSION_UPDATED',
      message: 'Sesión actualizada exitosamente',
      request_id: requestId,
      data: updated as unknown as SessionRecord,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Sesión actualizada: ${session.id}`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al actualizar sesión:`, error.message);
    
    const response: ApiError = {
      status: 'error',
      code: 'SESSION_UPDATE_ERROR',
      message: error.message || 'Error al actualizar sesión',
      request_id: requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id as string }
    });

    if (!session) {
      const error: ApiError = {
        status: 'error',
        code: 'SESSION_NOT_FOUND',
        message: `Sesión no encontrada: ${req.params.id}`,
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(error);
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'CANCELLED' }
    });

    const response: ApiResponse<{ id: string; status: string }> = {
      status: 'success',
      code: 'SESSION_CANCELLED',
      message: 'Sesión cancelada exitosamente',
      request_id: requestId,
      data: { id: session.id, status: 'CANCELLED' },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [${requestId}] Sesión cancelada: ${session.id}`);
    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al cancelar sesión:`, error.message);
    
    const response: ApiError = {
      status: 'error',
      code: 'SESSION_DELETE_ERROR',
      message: error.message || 'Error al cancelar sesión',
      request_id: requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

export const getSessions = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.userId) {
      filter.userId = req.query.userId as string;
    }
    if (req.query.status) {
      filter.status = req.query.status as string;
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.session.count({ where: filter })
    ]);

    const response: ApiResponse<SessionRecord[]> = {
      status: 'success',
      code: 'SESSIONS_RETRIEVED',
      message: `Se recuperaron ${sessions.length} sesiones`,
      request_id: requestId,
      data: sessions as unknown as SessionRecord[],
      details: {
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error al listar sesiones:`, error.message);
    
    const response: ApiError = {
      status: 'error',
      code: 'SESSIONS_ERROR',
      message: error.message || 'Error al listar sesiones',
      request_id: requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};
