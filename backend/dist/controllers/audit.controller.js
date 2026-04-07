import { prisma } from '../lib/prisma.js';
export const getAllAudits = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        // Parámetros de paginación
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        // Filtros opcionales
        const filter = {};
        if (req.query.status) {
            filter.verdictStatus = req.query.status;
        }
        if (req.query.from_date || req.query.to_date) {
            filter.createdAt = {};
            if (req.query.from_date) {
                filter.createdAt.gte = new Date(req.query.from_date);
            }
            if (req.query.to_date) {
                filter.createdAt.lte = new Date(req.query.to_date);
            }
        }
        // Obtener datos
        const [audits, total] = await Promise.all([
            prisma.audit.findMany({
                where: filter,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.audit.count({ where: filter })
        ]);
        const response = {
            status: 'success',
            code: 'AUDITS_RETRIEVED',
            message: `Se recuperaron ${audits.length} registros`,
            request_id: requestId,
            data: audits,
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
        console.error(`❌ [${requestId}] Error en auditoría:`, error.message);
        const response = {
            status: 'error',
            code: 'AUDIT_ERROR',
            message: error.message || 'Error al recuperar auditoría',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
export const getAuditDetail = async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
        const audit = await prisma.audit.findUnique({
            where: { id: req.params.id }
        });
        if (!audit) {
            const response = {
                status: 'error',
                code: 'AUDIT_NOT_FOUND',
                message: `Registro de auditoría no encontrado: ${req.params.id}`,
                request_id: requestId,
                timestamp: new Date().toISOString()
            };
            return res.status(404).json(response);
        }
        const response = {
            status: 'success',
            code: 'AUDIT_DETAIL_RETRIEVED',
            message: 'Detalles de auditoría recuperados',
            request_id: requestId,
            data: audit,
            timestamp: new Date().toISOString()
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Error en detalles:`, error.message);
        const response = {
            status: 'error',
            code: 'AUDIT_ERROR',
            message: error.message || 'Error al recuperar detalles de auditoría',
            request_id: requestId,
            timestamp: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
//# sourceMappingURL=audit.controller.js.map