# 🚀 QUICK START - ForenseID API FASE A

## ⚡ Inicio Rápido

### 1️⃣ Asegúrate que el servidor está corriendo
```bash
# Verificar si está activo
ps aux | grep "npm run dev"

# Si no está activo, inicia:
cd ~/Documentos/AWOS/ForenseID/backend
npm run dev
```

### 2️⃣ Accede a la documentación
```
🌐 http://localhost:4000/api-docs
```

### 3️⃣ Prueba los endpoints

#### Health Check (sin autenticación)
```bash
curl http://localhost:4000/health
```
**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2026-04-07T05:28:50.716Z","version":"1.0.0"}
```

#### Listar Auditorías (con API Key)
```bash
curl -H "Authorization: Bearer forenseid_demo_key_2026" \
  http://localhost:4000/api/v1/audits
```

#### Analizar Documento
```bash
curl -X POST \
  -H "Authorization: Bearer forenseid_demo_key_2026" \
  -F "document=@mi_documento.jpg" \
  http://localhost:4000/api/v1/documents/analyze
```

---

## 🔑 Demo API Keys

```
forenseid_demo_key_2026      ← Recomendado para pruebas
forenseid_test_sandbox       ← Para testing
```

---

## 📡 Métodos de Autenticación

### Método 1: Bearer Token (⭐ Recomendado)
```bash
curl -H "Authorization: Bearer forenseid_demo_key_2026" \
  http://localhost:4000/api/v1/audits
```

### Método 2: Query Parameter
```bash
curl "http://localhost:4000/api/v1/audits?api_key=forenseid_demo_key_2026"
```

### Método 3: Body JSON
```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -d '{"api_key":"forenseid_demo_key_2026"}' \
  http://localhost:4000/api/v1/audits
```

---

## 📊 Endpoints Disponibles

```
GET    /health
GET    /api/v1/audits
GET    /api/v1/audits/{id}
POST   /api/v1/documents/analyze
GET    /api/v1/resources/error-codes
```

---

## 🧪 Script de Prueba Automática

```bash
bash ~/Documentos/AWOS/ForenseID/test-api.sh
```

---

## 📁 Ubicaciones Importantes

| Item | Ruta |
|------|------|
| Backend | `~/Documentos/AWOS/ForenseID/backend` |
| Docs Swagger | `~/Documentos/AWOS/ForenseID/backend/docs/swagger.yaml` |
| Código principal | `~/Documentos/AWOS/ForenseID/backend/src/app.ts` |
| Base de datos | `~/Documentos/AWOS/ForenseID/backend/prisma/dev.db` |
| Script de prueba | `~/Documentos/AWOS/ForenseID/test-api.sh` |

---

## ⚙️ Configuración Rápida

**Puerto:** 4000  
**Protocolo:** HTTP  
**Base de datos:** SQLite  
**Auth:** API Key (Bearer/Query/Body)  

---

## 🐛 Troubleshooting

### Servidor no responde
```bash
# Mata procesos antiguos
killall npm node

# Reinicia
cd ~/Documentos/AWOS/ForenseID/backend && npm run dev
```

### Swagger UI no carga
```bash
# Verifica si el servidor está activo
curl http://localhost:4000/health

# Limpia y reconstruye
cd backend && npm run build && npm run dev
```

### Errores de compilación
```bash
# Regenera Prisma
npx prisma generate

# Recompila TypeScript
npm run build
```

---

## 📈 Próximas Acciones

- ✅ FASE A: Documentación (COMPLETADA)
- ⏳ FASE B: Endpoints de Sesiones
- ⏳ FASE C: Catálogos de Recursos
- ⏳ FASE D: Frontend Live Playground
- ⏳ FASE E: Deployment Vercel

---

## 📞 Soporte

- **Documentación técnica:** `FASE_A_COMPLETED.md`
- **Guía de usuario:** `README_FASE_A.md`
- **Resumen ejecutivo:** `EXECUTIVE_SUMMARY.md`
- **Script de prueba:** `test-api.sh`

---

**Última actualización:** 2026-04-07  
**Estado:** ✅ Operativo
