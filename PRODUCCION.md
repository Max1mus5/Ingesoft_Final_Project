# Guía de Configuración para Producción

Este documento te guía a través de los pasos necesarios para desplegar tanto el backend como el frontend a producción.

## 1. Backend (FastAPI) en Render

### Pasos para Configurar en Render:

1. **Conectar GitHub:**
   - Ve a [Render.com](https://render.com)
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona la rama `master`

2. **Configuración Básica:**
   - **Name:** `incapacidades-backend` (o el que prefieras)
   - **Environment:** Python 3.10
   - **Build Command:** `pip install -r Backend/requirements.txt`
   - **Start Command:** `cd Backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Variables de Entorno (Crítico):**
   
   En el dashboard de Render, ve a **Environment** y añade estas variables:
   
   ```
   DATABASE_URL=postgresql+asyncpg://usuario:password@host/dbname?ssl=require
   SECRET_KEY=<clave secreta fuerte - déjala que Render genere una>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   API_BASE_URL=https://incapacidades-backend.onrender.com
   ```

   > **IMPORTANTE:** `API_BASE_URL` debe ser exactamente la URL de tu servicio en Render. Puedes encontrarla en el dashboard después del primer deploy (ej: `https://incapacidades-backend.onrender.com`).

4. **Deploy:**
   - Click en "Create Web Service"
   - Render detectará `render.yaml` y seguirá las instrucciones

5. **Verificar:**
   - Visita `https://tu-backend-url/docs` para ver la documentación interactiva
   - Intenta hacer login: `GET https://tu-backend-url/api/auth/login`

---

## 2. Frontend (Next.js) en Vercel

### Pasos para Configurar en Vercel:

1. **Conectar GitHub:**
   - Ve a [Vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configuración del Proyecto:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `Frontend` (importante, ya que el proyecto está en esa carpeta)
   - **Build Command:** `pnpm install && pnpm build` (por defecto)
   - **Output Directory:** `.next`

3. **Variables de Entorno (Crítico):**
   
   En el dashboard de Vercel, ve a **Settings** → **Environment Variables** y añade:
   
   ```
   NEXT_PUBLIC_API_URL=https://incapacidades-backend.onrender.com/api
   ```

   > **IMPORTANTE:** Usa la URL COMPLETA de tu backend incluyendo `/api`. Reemplaza `incapacidades-backend.onrender.com` con tu URL real.

4. **Deploy:**
   - Click en "Deploy"
   - Vercel automáticamente deployará cuando hagas push a `master`

5. **Verificar:**
   - Visita tu URL de Vercel (ej: `https://ingesoft-final-project.vercel.app`)
   - Intenta hacer login
   - Crea una incapacidad y verifica que los archivos se descarguen correctamente

---

## 3. Troubleshooting

### Problema: Los archivos no se descargan (Error 404)

**Síntoma:** Ves URLs como `http://localhost:8000/uploads/...` en lugar de la URL de producción.

**Solución:**
1. Verifica que `API_BASE_URL` esté configurada correctamente en Render
2. Redeploy el backend en Render
3. En Vercel, verifica que `NEXT_PUBLIC_API_URL` sea correcto

### Problema: CORS error

**Síntoma:** No puedes hacer login o requests se rechazan por CORS

**Solución:**
1. El backend en `app/main.py` ya tiene configurado CORS para Vercel
2. Si aún hay problemas, verifica que tu URL de Vercel esté en la lista de `allow_origins`

### Problema: Base de datos vacía en producción

**Síntoma:** No ves datos después de desplegar

**Solución:**
1. Las tablas se crean automáticamente (seed en startup)
2. Pero necesitas un usuario seeded - vuelve a ejecutar el seed en la DB
3. Usa el endpoint de `/api/auth/registrar` para crear usuarios

---

## 4. Base de Datos (Neon PostgreSQL)

1. Crea una cuenta en [Neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Obtén la URL de conexión: `postgresql+asyncpg://...`
4. Copia esa URL como `DATABASE_URL` en Render

---

## 5. Flujo de Despliegue Recomendado

1. **Primero:** Configura y deploya el backend en Render
2. **Obtén la URL:** Anota la URL del backend (ej: `https://incapacidades-backend.onrender.com`)
3. **Luego:** Configura el frontend en Vercel con esa URL como `NEXT_PUBLIC_API_URL`
4. **Deploy:** Ambos se actualizarán automáticamente con cada push a `master`

---

## 6. Comandos Útiles

### Backend - Render Logs:
```bash
render logs <service-id>
```

### Frontend - Vercel Logs:
En el dashboard de Vercel, click en el proyecto → Logs

### Ver status de servicios:
- Backend (Render): https://status.render.com
- Frontend (Vercel): https://status.vercel.com

---

## Resumen de URLs

Después de desplegar, tendrás:

- **Backend API:** `https://incapacidades-backend.onrender.com/api`
- **Backend Docs:** `https://incapacidades-backend.onrender.com/docs`
- **Frontend:** `https://ingesoft-final-project.vercel.app` (o tu URL custom)

Los archivos cargados se servirán desde: `https://incapacidades-backend.onrender.com/uploads/{uuid}.pdf`
