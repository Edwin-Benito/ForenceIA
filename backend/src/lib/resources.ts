/**
 * Catálogos de recursos para ForenseID
 * Estados mexicanos, tipos de documentos, veredictos y códigos de error
 */

export const MEXICAN_STATES = [
  { code: "AG", name: "Aguascalientes" },
  { code: "BC", name: "Baja California" },
  { code: "BS", name: "Baja California Sur" },
  { code: "CC", name: "Campeche" },
  { code: "CH", name: "Chiapas" },
  { code: "CI", name: "Chihuahua" },
  { code: "CM", name: "CDMX" },
  { code: "CO", name: "Coahuila" },
  { code: "DG", name: "Durango" },
  { code: "GT", name: "Guanajuato" },
  { code: "GR", name: "Guerrero" },
  { code: "HG", name: "Hidalgo" },
  { code: "JC", name: "Jalisco" },
  { code: "MC", name: "Estado de México" },
  { code: "MH", name: "Michoacán" },
  { code: "MO", name: "Morelos" },
  { code: "NA", name: "Nayarit" },
  { code: "NL", name: "Nuevo León" },
  { code: "OC", name: "Oaxaca" },
  { code: "PL", name: "Puebla" },
  { code: "QE", name: "Querétaro" },
  { code: "QR", name: "Quintana Roo" },
  { code: "SL", name: "San Luis Potosí" },
  { code: "SI", name: "Sinaloa" },
  { code: "SO", name: "Sonora" },
  { code: "TB", name: "Tabasco" },
  { code: "TM", name: "Tamaulipas" },
  { code: "TL", name: "Tlaxcala" },
  { code: "VZ", name: "Veracruz" },
  { code: "YN", name: "Yucatán" },
  { code: "ZC", name: "Zacatecas" }
];

export const DOCUMENT_TYPES = [
  { code: "INE", name: "Cédula de Identidad (INE)", country: "México" },
  { code: "PASSPORT", name: "Pasaporte", country: "México" },
  { code: "CÉDULA", name: "Cédula de Ciudadanía", country: "México" },
  { code: "LICENSE", name: "Licencia de Conducir", country: "México" },
  { code: "MILITARY", name: "Credencial Militar", country: "México" },
  { code: "TEMP_RESIDENT", name: "Residente Temporal", country: "México" },
  { code: "PERM_RESIDENT", name: "Residente Permanente", country: "México" },
  { code: "DIPLOMATIC", name: "Pasaporte Diplomático", country: "Internacional" },
  { code: "TRAVEL_DOC", name: "Documento de Viaje", country: "Internacional" },
  { code: "NATIONAL_ID", name: "Cédula Nacional", country: "Internacional" }
];

export const VERDICT_STATUSES = [
  { code: "VERDADERO", label: "Documento Auténtico", color: "emerald", description: "El documento pasó todas las validaciones de autenticidad." },
  { code: "FALSO", label: "Documento Falso", color: "red", description: "El documento no pasó las validaciones de autenticidad." },
  { code: "SOSPECHOSO", label: "Documento Sospechoso", color: "amber", description: "El documento presenta inconsistencias que requieren revisión manual." },
  { code: "INCOMPLETO", label: "Documento Incompleto", color: "slate", description: "El documento no tiene suficiente información para verificar." },
  { code: "EXPIRADO", label: "Documento Expirado", color: "orange", description: "El documento está fuera de su fecha de validez." },
  { code: "CANCELADO", label: "Documento Cancelado", color: "red", description: "El documento ha sido cancelado oficialmente." },
  { code: "ESPECIMEN", label: "Documento Especimen", color: "blue", description: "El documento es un especimen o ejemplo, no válido para uso." }
];

export const ERROR_CODES = [
  // Errores de autenticación (1xxx)
  {
    code: "AUTH_001",
    message: "API Key inválida o expirada",
    statusCode: 401,
    category: "authentication"
  },
  {
    code: "AUTH_002",
    message: "Token no proporcionado",
    statusCode: 401,
    category: "authentication"
  },
  {
    code: "AUTH_003",
    message: "Formato de token inválido",
    statusCode: 401,
    category: "authentication"
  },
  
  // Errores de validación (2xxx)
  {
    code: "VALID_001",
    message: "Archivo de imagen no válido",
    statusCode: 400,
    category: "validation"
  },
  {
    code: "VALID_002",
    message: "Tamaño de archivo excede el límite",
    statusCode: 413,
    category: "validation"
  },
  {
    code: "VALID_003",
    message: "Formato de imagen no soportado",
    statusCode: 400,
    category: "validation"
  },
  {
    code: "VALID_004",
    message: "Documento no detectado en la imagen",
    statusCode: 422,
    category: "validation"
  },
  {
    code: "VALID_005",
    message: "Datos requeridos faltantes",
    statusCode: 400,
    category: "validation"
  },
  
  // Errores de procesamiento (3xxx)
  {
    code: "PROCESS_001",
    message: "Error en análisis OCR",
    statusCode: 500,
    category: "processing"
  },
  {
    code: "PROCESS_002",
    message: "Error en análisis de visión por computadora",
    statusCode: 500,
    category: "processing"
  },
  {
    code: "PROCESS_003",
    message: "Error en análisis EXIF",
    statusCode: 500,
    category: "processing"
  },
  {
    code: "PROCESS_004",
    message: "Timeout en análisis de documento",
    statusCode: 504,
    category: "processing"
  },
  {
    code: "PROCESS_005",
    message: "Error en procesamiento de sesión",
    statusCode: 500,
    category: "processing"
  },
  
  // Errores de base de datos (4xxx)
  {
    code: "DB_001",
    message: "Error en base de datos",
    statusCode: 500,
    category: "database"
  },
  {
    code: "DB_002",
    message: "Registro no encontrado",
    statusCode: 404,
    category: "database"
  },
  {
    code: "DB_003",
    message: "Error de integridad de datos",
    statusCode: 409,
    category: "database"
  },
  
  // Errores de recurso (5xxx)
  {
    code: "RESOURCE_001",
    message: "Sesión no encontrada",
    statusCode: 404,
    category: "resource"
  },
  {
    code: "RESOURCE_002",
    message: "Sesión expirada",
    statusCode: 410,
    category: "resource"
  },
  {
    code: "RESOURCE_003",
    message: "Documento no encontrado",
    statusCode: 404,
    category: "resource"
  },
  {
    code: "RESOURCE_004",
    message: "Usuario no autorizado",
    statusCode: 403,
    category: "resource"
  },
  
  // Errores de limitación (6xxx)
  {
    code: "RATE_001",
    message: "Límite de solicitudes excedido",
    statusCode: 429,
    category: "rate-limit"
  },
  {
    code: "RATE_002",
    message: "Cuota diaria agotada",
    statusCode: 429,
    category: "rate-limit"
  }
];
