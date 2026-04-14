/**
 * Tipos estandarizados para todas las respuestas de la API
 * Siguiendo el estilo de APIs profesionales (Stripe, Factus, etc.)
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  code: string;
  message: string;
  request_id: string;
  data?: T;
  details?: Record<string, any>;
  timestamp: string;
  engine?: string;
}

export interface ApiError extends ApiResponse<null> {
  status: 'error';
}

export interface DocumentAnalysisResponse {
  fullName: string;
  documentId: string;
  curp: string;
  birthDate: string;
  sex: string;
  electionKey: string;
  state: string;
  issuedDate: string;
  expiryDate: string;
  faceConfidence: number;
  verdict: {
    status: 'VERDADERO' | 'FALSO';
    message: string;
    color: string;
  };
  documentOrigin: string;
  isDigitallyAltered: boolean;
  isSpecimen: boolean;
  engineVersion: string;
}

export interface AuditRecord {
  id: string;
  createdAt: Date;
  fullName: string;
  documentId: string;
  curp: string | null;
  birthDate: string | null;
  sex: string | null;
  electionKey: string | null;
  state: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  faceConfidence: number;
  isDigitallyAltered: boolean;
  isSpecimen: boolean;
  verdictStatus: string;
  verdictMessage: string;
  documentOrigin: string;
  engineVersion: string;
}

export interface AuthTokenResponse {
  token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface ApiKeyInfo {
  key: string;
  created_at: string;
  last_used: string | null;
  name: string;
}
export interface SessionRecord {
  id: string;
  createdAt: Date;
  userId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  documentId: string | null;
  verificationData: string | null;
  expiresAt: Date;
  completedAt: Date | null;
  result: string | null;
  notes: string | null;
}

export interface CreateSessionRequest {
  userId: string;
  durationMinutes?: number;
}

export interface UpdateSessionRequest {
  status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  documentId?: string;
  result?: string;
  notes?: string;
}