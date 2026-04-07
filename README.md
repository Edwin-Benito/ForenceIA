# 🛡️ ForenseID - Sistema Profesional de Análisis Forense de Identidad

> **Validación e inteligencia artificial para documentos de identidad mexicanos e internacionales**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Node](https://img.shields.io/badge/node-20.x-green)
![Vue](https://img.shields.io/badge/Vue-3-green)

## 📋 Características

- 🔍 **OCR Avanzado** - Extracción de datos usando Google Cloud Document AI
- 🤖 **Detección de Alteraciones** - Análisis EXIF, metadatos, patrones digitales
- 👤 **Biometría Facial** - Detección de rostro y análisis de confianza
- ✅ **Validación de CURP/RFC** - Validación matemática de dígitos verificadores
- 🌐 **Cross-Validation** - Coincidencia de datos entre múltiples fuentes
- 📊 **API REST Completa** - Endpoints documentados con Swagger/OpenAPI
- 🎮 **Live Playground** - Interfaz interactiva para probar endpoints
- 📱 **Responsive Design** - Funciona en desktop, tablet y móvil

## 🚀 Quick Start

### Prerequisitos
- Node.js 20.x
- npm 10.x
- SQLite3 (incluido en el proyecto)
- Google Cloud Account (para OCR y Vision)

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/yourusername/forenseid.git
cd forenseid

# 2. Backend Setup
cd backend
cp .env.example .env
# Editar .env con tus credenciales de Google Cloud
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# 3. Frontend Setup (en otra terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev

# 4. Acceder
- API: http://localhost:4000
- API Docs: http://localhost:4000/api-docs
- Frontend: http://localhost:5173
- Playground: http://localhost:5173 → API Playground
```

## 📚 Documentación

### Estructura del Proyecto

```
forenseid/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Aplicación Express principal
│   │   ├── controllers/           # Lógica de controladores
│   │   │   ├── document.controller.ts
│   │   │   ├── session.controller.ts
│   │   │   ├── resources.controller.ts
│   │   │   └── audit.controller.ts
│   │   ├── routes/                # Definición de rutas
│   │   ├── services/              # Lógica de negocio
│   │   ├── types/                 # Tipos TypeScript
│   │   ├── utils/                 # Utilidades
│   │   ├── lib/                   # Librerías (Prisma, recursos)
│   │   └── middlewares/           # Middlewares Express
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de BD
│   │   └── migrations/            # Migraciones
│   ├── docs/
│   │   └── swagger.yaml           # OpenAPI/Swagger spec
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.vue                # Componente raíz
│   │   ├── components/
│   │   │   ├── DocumentScanner.vue
│   │   │   └── APIPlayground.vue
│   │   ├── main.ts
│   │   └── style.css
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions CI/CD
│
├── vercel.json                    # Configuración Vercel
└── README.md
```

### API Endpoints

#### Recursos (sin autenticación)
```
GET  /api/v1/resources/states           → Estados mexicanos
GET  /api/v1/resources/document-types   → Tipos de documentos
GET  /api/v1/resources/verdicts         → Estados de veredicto
GET  /api/v1/resources/error-codes      → Códigos de error
```

#### Sesiones (requiere API Key)
```
POST /api/v1/sessions                   → Crear sesión
GET  /api/v1/sessions                   → Listar sesiones (con paginación)
GET  /api/v1/sessions/{id}              → Obtener sesión
PUT  /api/v1/sessions/{id}              → Actualizar sesión
DELETE /api/v1/sessions/{id}            → Cancelar sesión
```

#### Documentos (requiere API Key)
```
POST /api/v1/documents/analyze          → Analizar documento (multipart/form-data)
```

#### Auditoría (requiere API Key)
```
GET  /api/v1/audits                     → Historial de análisis
GET  /api/v1/audits/{id}                → Detalles de análisis
```

#### Health
```
GET  /health                            → Estado del servidor (sin auth)
```

### Autenticación

La API soporta 3 métodos de autenticación:

**1. Bearer Token (recomendado)**
```bash
curl -H "Authorization: Bearer forenseid_demo_key_2026" \
  http://localhost:4000/api/v1/sessions
```

**2. Query Parameter**
```bash
curl "http://localhost:4000/api/v1/sessions?api_key=forenseid_demo_key_2026"
```

**3. Body JSON**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"api_key": "forenseid_demo_key_2026", "userId": "user_123"}' \
  http://localhost:4000/api/v1/sessions
```

### Ejemplos de Uso

#### Crear Sesión
```bash
curl -X POST \
  -H "Authorization: Bearer forenseid_demo_key_2026" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "durationMinutes": 30
  }' \
  http://localhost:4000/api/v1/sessions
```

#### Analizar Documento
```bash
curl -X POST \
  -H "Authorization: Bearer forenseid_demo_key_2026" \
  -F "document=@/path/to/document.jpg" \
  http://localhost:4000/api/v1/documents/analyze
```

#### Listar Estados Mexicanos
```bash
curl http://localhost:4000/api/v1/resources/states | jq '.'
```

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Google Cloud
GCP_PROJECT_ID=your_project_id
GCP_LOCATION=us
GCP_PROCESSOR_ID=your_processor_id

# Server
PORT=4000
NODE_ENV=production

# API Keys
API_KEY_DEMO=forenseid_demo_key_2026
```

#### Frontend (.env)
```env
VITE_API_URL=https://forenseid-api.vercel.app/api/v1
VITE_APP_NAME=ForenseID
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio a Vercel**
   ```bash
   vercel link
   ```

2. **Configurar variables de entorno**
   - Ve a Vercel Dashboard → Project Settings → Environment Variables
   - Agrega todas las variables de `.env.example`

3. **Deploy automático**
   - Cada push a `main` despliega automáticamente
   - GitHub Actions ejecuta tests primero

4. **URLs de Producción**
   - API: `https://forenseid-api.vercel.app/api/v1`
   - Frontend: `https://forenseid.vercel.app`
   - Docs: `https://forenseid-api.vercel.app/api-docs`

### Manual Deploy

```bash
# 1. Build
cd backend && npm run build
cd ../frontend && npm run build

# 2. Deploy con Vercel CLI
vercel --prod

# 3. Ver logs
vercel logs
```

## 📊 Modelos de Base de Datos

### Session
```typescript
{
  id: string (CUID)
  createdAt: DateTime
  userId: string
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

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
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

## 🔐 Seguridad

- ✅ Validación de API Key en todos los endpoints protegidos
- ✅ CORS configurado para dominios específicos
- ✅ Rate limiting (implementar en producción)
- ✅ Input validation en todos los endpoints
- ✅ Sanitización de datos antes de guardar
- ✅ HTTPS en producción
- ✅ Variables sensibles en .env (no commiteadas)

## 📈 Performance

- Backend: Express.js optimizado con compresión
- Frontend: Vue 3 con vite build optimization
- Database: SQLite con índices
- API: Response caching headers
- CDN: Vercel Edge Network

## 🐛 Troubleshooting

### Puerto 4000 ya está en uso
```bash
# Kill el proceso
lsof -ti:4000 | xargs kill -9
```

### Prisma Client no actualizado
```bash
# Limpiar y regenerar
rm -rf node_modules/.prisma
npx prisma generate
```

### Frontend no ve la API
```bash
# Verificar VITE_API_URL en .env
cat frontend/.env
# Debe apuntar a http://localhost:4000/api/v1 en desarrollo
```

### Google Cloud credentials
```bash
# Verificar que el archivo JSON esté en la ruta correcta
ls -la backend/forenseid-*.json
```

## 📞 Soporte

- 📧 Email: support@forenseid.mx
- 🐛 Issues: github.com/yourusername/forenseid/issues
- 📖 Docs: https://forenseid.mx/docs

## 📄 Licencia

Proprietary License - Todos los derechos reservados © 2026

## 👥 Contribuidores

- **Benito** - Lead Developer

---

**Última actualización:** 7 de Abril, 2026
**Versión:** 1.0.0
**Estado:** ✅ Producción
