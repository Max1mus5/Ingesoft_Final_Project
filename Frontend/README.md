# Frontend - Sistema de Gestión de Incapacidades y Recobros

Este proyecto está construido con **Next.js 16** (App Router), **React 19**, **TypeScript** y **Tailwind CSS**.

## Requisitos Previos

- Node.js 18 o superior
- pnpm (gestor de paquetes)
- Git (para control de versiones)

## Inicialización y Configuración Local

Sigue estos pasos para correr el frontend de forma local:

### 1. Instalación de Dependencias

```bash
cd Frontend
pnpm install
```

### 2. Configuración de Variables de Entorno (`.env.local`)

Crea un archivo `.env.local` en la raíz de la carpeta `Frontend/` con esta estructura:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> **Nota:** Este archivo no debe integrarse al control de versiones de Git.

La variable `NEXT_PUBLIC_API_URL` debe apuntar a tu backend:
- **Local:** `http://localhost:8000/api` (si tu backend corre en puerto 8000)
- **Producción:** `https://incapacidades-backend.onrender.com/api` (o similar, según tu URL en Render)

### 3. Lanzar el Servidor Frontend (Desarrollo)

```bash
pnpm dev
```

El servidor estará disponible en:
- **http://localhost:3000**

O también puedes usar:
```bash
pnpm dev -p 3001
```

Para correr en puerto 3001 si es necesario.

---

## Configuración en Producción (Vercel)

### Variables de Entorno en Vercel

En el dashboard de Vercel, agrega esta variable de entorno:

- **`NEXT_PUBLIC_API_URL`**: La URL completa de tu backend en Render (ej: `https://incapacidades-backend.onrender.com/api`)

> **Importante:** Las variables que comienzan con `NEXT_PUBLIC_` son públicas y se embeben en el código del cliente. Asegúrate de que sea la URL correcta del backend.

### Deploy en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Settings → Environment Variables
3. Vercel detectará automáticamente que es un proyecto Next.js y lo deployará

---

## Build para Producción

```bash
pnpm build
```

Para testear el build localmente:

```bash
pnpm start
```

---

## Estructura del Proyecto

- **`app/`**: Rutas de Next.js (página de login, dashboard, incapacidades, etc.)
- **`components/`**: Componentes React reutilizables (tablas, formularios, alertas, etc.)
- **`lib/`**: Utilidades (API client, auth store, tipos, etc.)
- **`hooks/`**: Custom React hooks
- **`styles/`**: Estilos globales
- **`public/`**: Archivos estáticos

---

## Notas Importantes

1. **API URL:** Asegúrate de que `NEXT_PUBLIC_API_URL` sea correcta según tu entorno (local vs. producción).
2. **CORS:** El backend debe tener CORS configurado para permitir requests desde tu dominio de Vercel.
3. **JWT Token:** Se almacena en `localStorage` bajo la clave `auth_token`.
4. **Auto-refresh:** El dashboard se actualiza automáticamente cada 5 segundos y cuando se crean nuevas incapacidades.
