# 🛡️ ForenseID

ForenseID es una solución full‑stack para **análisis forense de documentos de identidad** (INE México y pasaportes) con:

- OCR (Tesseract.js) con preprocesamiento y extracción robusta
- Biometría facial (Face‑API) opcional
- Integridad digital (EXIF / señales de manipulación)
- Etapa Google Cloud (Document AI + Vision) **opcional**
- Auditoría persistente en SQLite (Prisma)

El frontend muestra **solo 2 modos**:

1) **UNIFICADO GRATIS**: OCR + Face (y Google Cloud solo si está configurado)
2) **Google Cloud (AI Avanzado)**: solo la etapa Cloud

Nota: el frontend está simplificado para **subir una imagen** (sin cámara integrada).

## ✅ Requisitos

- Node.js 20.x (recomendado por la config de Vercel)
- npm

## 🚀 Inicio rápido (Local)

### 1) Backend

```bash
cd backend
npm install

# (opcional pero recomendado) descargar modelos de Face-API
npm run download:face-models

# Prisma (SQLite)
npx prisma generate
npx prisma migrate dev

# levantar API
npm run dev
```

API disponible en:

- http://localhost:4000/api/v1
- Swagger UI: http://localhost:4000/api-docs

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend en:

- http://localhost:5173

## 🔐 Autenticación (API Key)

Las rutas bajo `/api/v1` (excepto `/api/v1/health` y `/api/v1/resources/*`) usan `validateApiKey`.

Puedes enviar la API key de cualquiera de estas formas:

- Header: `X-API-Key: <key>` (usado por el frontend)
- Header: `Authorization: Bearer <key>`
- Query: `?api_key=<key>`
- Body JSON: `{ "api_key": "<key>" }`

Key demo por defecto:

```text
forenseid_demo_key_2026
```

## 🧪 Endpoints principales

Base local: `http://localhost:4000`

### Health

- `GET /health` (sin auth)
- `GET /api/v1/health` (sin auth)

### Documentos (multipart/form-data, field = `document`, máx 5MB)

- `POST /api/v1/documents/analyze-unified` (recomendado)
  - Ejecuta OCR + Face‑API + Cloud (si está configurado) en una sola llamada.
  - Si Cloud falla por credenciales, el request **no se cae**: el stage `cloud` queda como error y el resto continúa.

- `POST /api/v1/documents/analyze` (Google Cloud)
  - Requiere configuración GCP (sin fallback simulado).

Endpoints adicionales (útiles para debug):

- `POST /api/v1/documents/analyze-free` (solo OCR Tesseract)
- `POST /api/v1/documents/analyze-advanced` (OCR + Face‑API + Cloudinary)

### Auditorías (SQLite)

- `GET /api/v1/audits`


## 🧩 Respuesta (forma general)

Las respuestas siguen un “envelope” consistente.

Éxito:

```json
{
  "status": "success",
  "code": "...",
  "message": "...",
  "request_id": "req_...",
  "data": { },
  "timestamp": "2026-...",
  "reportToken": "..."
}
```

Error:

```json
{
  "status": "error",
  "code": "...",
  "message": "...",
  "request_id": "req_...",
  "timestamp": "2026-..."
}
```

## 📁 Estructura del proyecto

```text
.
├── backend/   # Express + TypeScript + Prisma (SQLite)
└── frontend/  # Vue 3 + Vite
```
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED"
  documentId?: string
  verificationData?: string
  expiresAt: DateTime
  completedAt?: DateTime
  result?: string
  notes?: string
}
```

### Audit
```typescript
{
  id: string (CUID)
  createdAt: DateTime
  fullName: string
  documentId: string
  curp?: string
  birthDate?: string
  sex?: string
  electionKey?: string
  state?: string
  issuedDate?: string
  expiryDate?: string
  faceConfidence: number
  isDigitallyAltered: boolean
  isSpecimen: boolean
  verdictStatus: string
  verdictMessage: string
  documentOrigin: string
  engineVersion: string
}
```


## 📝 API Response Format

Todos los endpoints retornan respuestas estandarizadas:

**Success (2xx)**
```json
{
  "status": "success",
  "code": "REQUEST_CODE",
  "message": "Descripción del éxito",
  "request_id": "req_1234567890",
  "data": { /* response data */ },
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

**Error (4xx, 5xx)**
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Descripción del error",
  "request_id": "req_1234567890",
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```


