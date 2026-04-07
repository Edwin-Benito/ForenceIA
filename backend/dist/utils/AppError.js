export class AppError extends Error {
    statusCode;
    status;
    errorCode;
    isOperational;
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
        this.errorCode = errorCode;
        this.isOperational = true; // Errores predecibles (ej. archivo no enviado)
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map