import { prisma } from '../lib/prisma.js';
export const createSession = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        const { userId, durationMinutes = 30 } = req.body;
        if (!userId) {
            const error = {
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
        const response = {
            status: 'success',
            code: 'SESSION_CREATED',
            message: 'Sesión creada exitosamente',
            request_id: requestId,
            data: session,
            timestamp: new Date().toISOString()
        };
        console.log(`✅ [${requestId}] Sesión creada: ${session.id}`);
        res.status(201).json(response);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Error al crear sesión:`, error.message);
        const response = {
            status: 'error',
            code: 'SESSION_CREATE_ERROR',
            message: error.message || 'Error al crear sesión',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
export const getSession = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        const session = await prisma.session.findUnique({
            where: { id: req.params.id }
        });
        if (!session) {
            const error = {
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
        const response = {
            status: 'success',
            code: 'SESSION_RETRIEVED',
            message: 'Sesión recuperada',
            request_id: requestId,
            data: session,
            timestamp: new Date().toISOString()
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Error al obtener sesión:`, error.message);
        const response = {
            status: 'error',
            code: 'SESSION_ERROR',
            message: error.message || 'Error al obtener sesión',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
export const updateSession = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        const { status, documentId, result, notes } = req.body;
        const session = await prisma.session.findUnique({
            where: { id: req.params.id }
        });
        if (!session) {
            const error = {
                status: 'error',
                code: 'SESSION_NOT_FOUND',
                message: `Sesión no encontrada: ${req.params.id}`,
                request_id: requestId,
                timestamp: new Date().toISOString()
            };
            return res.status(404).json(error);
        }
        // Preparar datos a actualizar
        const updateData = {};
        if (status)
            updateData.status = status;
        if (documentId)
            updateData.documentId = documentId;
        if (result)
            updateData.result = result;
        if (notes)
            updateData.notes = notes;
        // Si el estado es COMPLETED, registrar fecha de finalización
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
        }
        const updated = await prisma.session.update({
            where: { id: session.id },
            data: updateData
        });
        const response = {
            status: 'success',
            code: 'SESSION_UPDATED',
            message: 'Sesión actualizada exitosamente',
            request_id: requestId,
            data: updated,
            timestamp: new Date().toISOString()
        };
        console.log(`✅ [${requestId}] Sesión actualizada: ${session.id}`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Error al actualizar sesión:`, error.message);
        const response = {
            status: 'error',
            code: 'SESSION_UPDATE_ERROR',
            message: error.message || 'Error al actualizar sesión',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
export const deleteSession = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        const session = await prisma.session.findUnique({
            where: { id: req.params.id }
        });
        if (!session) {
            const error = {
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
        const response = {
            status: 'success',
            code: 'SESSION_CANCELLED',
            message: 'Sesión cancelada exitosamente',
            request_id: requestId,
            data: { id: session.id, status: 'CANCELLED' },
            timestamp: new Date().toISOString()
        };
        console.log(`✅ [${requestId}] Sesión cancelada: ${session.id}`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Error al cancelar sesión:`, error.message);
        const response = {
            status: 'error',
            code: 'SESSION_DELETE_ERROR',
            message: error.message || 'Error al cancelar sesión',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
export const getSessions = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.userId) {
            filter.userId = req.query.userId;
        }
        if (req.query.status) {
            filter.status = req.query.status;
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
        const response = {
            status: 'success',
            code: 'SESSIONS_RETRIEVED',
            message: `Se recuperaron ${sessions.length} sesiones`,
            request_id: requestId,
            data: sessions,
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
    }
    catch (error) {
        console.error(`❌ [${requestId}] Error al listar sesiones:`, error.message);
        const response = {
            status: 'error',
            code: 'SESSIONS_ERROR',
            message: error.message || 'Error al listar sesiones',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
//# sourceMappingURL=session.controller.js.map