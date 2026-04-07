import { AppError } from '../utils/AppError.js';
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Si es un error controlado por nosotros (AppError)
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            code: err.errorCode,
            message: err.message,
        });
    }
    else {
        // Errores de programación no controlados
        console.error('💥 ERROR CRÍTICO:', err);
        res.status(500).json({
            status: 'error',
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Algo salió muy mal en el motor forense.',
        });
    }
};
//# sourceMappingURL=errorHandler.js.map