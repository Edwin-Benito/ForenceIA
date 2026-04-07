export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public errorCode: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
    this.errorCode = errorCode;
    this.isOperational = true; // Errores predecibles (ej. archivo no enviado)

    Error.captureStackTrace(this, this.constructor);
  }
}