# 🚀 Guía de Deployment a Vercel

## Prerequisitos

1. **Cuenta de Vercel** - [Crear en vercel.com](https://vercel.com/signup)
2. **Repositorio en GitHub** - Push del código a GitHub
3. **Google Cloud Credentials** - Para OCR y Vision API

## Pasos de Deployment

### 1. Preparar el Repositorio

```bash
# Asegurar que todo esté commiteado
git status
git add .
git commit -m "Preparar para deployment a Vercel"
git push origin main
```

### 2. Conectar Vercel a GitHub

1. Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click en "Add New..." → "Project"
3. Seleccionar "Import Git Repository"
4. Buscar y seleccionar `forenseid`
5. Click en "Import"

### 3. Configurar Variables de Entorno

En Vercel Dashboard:

1. Ir a **Settings** → **Environment Variables**
2. Agregar las siguientes variables:

**Backend Variables:**
```
GCP_PROJECT_ID = tu_proyecto_gcp
GCP_LOCATION = us
GCP_PROCESSOR_ID = tu_processor_id
API_KEY_DEMO = forenseid_demo_key_2026
NODE_ENV = production
DATABASE_URL = file:./prisma/dev.db
CORS_ORIGIN = https://forenseid.vercel.app,https://your-domain.com
```

**Frontend Variables:**
```
VITE_API_URL = https://forenseid-api.vercel.app/api/v1
VITE_APP_NAME = ForenseID
VITE_APP_VERSION = 1.0.0
```

### 4. Configuración de Build

Vercel detectará automáticamente la configuración de `vercel.json`.

- **Backend Root**: `/backend`
- **Frontend Root**: `/frontend`
- **Build Command**: `npm run build`
- **Install Command**: `npm ci`

### 5. Primer Deploy

1. Vercel desplegará automáticamente después de detectar `vercel.json`
2. Esperar a que complete la construcción
3. Ver logs en **Deployments** tab
4. URL será algo como: `https://forenseid-api.vercel.app`

### 6. Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Click en "Add Domain"
3. Ingresa tu dominio (ej: `forenseid.mx`)
4. Sigue las instrucciones para configurar DNS

## Estructura de URL en Producción

```
API Base:       https://forenseid-api.vercel.app/api/v1
API Docs:       https://forenseid-api.vercel.app/api-docs
Health Check:   https://forenseid-api.vercel.app/health
Frontend:       https://forenseid.vercel.app
Playground:     https://forenseid.vercel.app/playground
```

## GitHub Actions CI/CD

El archivo `.github/workflows/deploy.yml` ejecutará automáticamente:

1. **Build Test** - En cada push
   - Instala dependencias
   - Genera Prisma Client
   - Compila TypeScript
   - Build frontend

2. **Deployment** - Solo en push a `main`
   - Ejecuta tests
   - Despliega a Vercel
   - Actualiza variables de entorno

### Secrets Necesarios en GitHub

En tu repositorio → Settings → Secrets:

```
VERCEL_TOKEN         # Token de Vercel (https://vercel.com/account/tokens)
VERCEL_ORG_ID        # ID de tu organización en Vercel
VERCEL_PROJECT_ID    # ID del proyecto (se crea automáticamente)
```

Para obtener estos valores:

1. Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Crea un token nuevo
3. Copia el token a `VERCEL_TOKEN`
4. En Vercel Dashboard, ve al proyecto
5. Settings → General → Project ID (copia a `VERCEL_PROJECT_ID`)
6. Team Settings → Team ID (copia a `VERCEL_ORG_ID`)

## Monitoreo en Producción

### Logs

```bash
vercel logs
```

### Analytics

1. Dashboard Vercel → Analytics
2. Ver performance, errors, usage

### Debugging

```bash
# Ver estado actual
vercel status

# Ver últimos deployments
vercel ls

# Rollback a versión anterior
vercel rollback
```

## Troubleshooting

### Error: "BUILD FAILED"

**Solución:**
```bash
# Verificar localmente
npm run build

# Limpiar cache de Vercel
vercel env pull
rm -rf node_modules
npm ci
npm run build
```

### Error: "Cannot find module"

**Solución:**
- Verificar que imports incluyan extensión `.js`
- Asegurar que `tsconfig.json` tiene `moduleResolution: "bundler"`
- Regenerar Prisma Client: `npx prisma generate`

### API Key no funciona en producción

**Solución:**
- Verificar que `API_KEY_DEMO` esté en variables de entorno
- Revisar que el header `Authorization: Bearer ...` sea correcto
- Verificar CORS: `CORS_ORIGIN` debe incluir tu dominio frontend

### Base de datos vacía en producción

**Solución:**
```bash
# Ejecutar migraciones en producción
vercel env pull
npx prisma migrate deploy
```

## Rollback a Versión Anterior

```bash
# Ver deployments anteriores
vercel ls

# Ir a Deployments tab en dashboard
# Seleccionar deployment anterior
# Click en "Promote to Production"
```

## Monitorar Costos

- Vercel Free tier: hasta 100GB bandwidth/mes
- Para más, upgrade a Pro ($20/mes)
- Analytics en Dashboard

## Limpieza de Deployments Antiguos

```bash
# Borrar deployments antiguos (opcional)
vercel rm old-deployment-url
```

## Próximos Pasos

1. ✅ Proyecto deployado en Vercel
2. 📊 Monitorear performance y errors
3. 🔐 Habilitar analytics
4. 🚨 Configurar alertas
5. 📈 Escalado según necesidad

## Recursos Útiles

- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI Docs](https://vercel.com/cli)
- [Node.js en Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/node)
- [Vercel Edge Functions](https://vercel.com/docs/concepts/edge-functions)

---

**Para preguntas:** support@forenseid.mx
**Status Page:** https://status.vercel.com
