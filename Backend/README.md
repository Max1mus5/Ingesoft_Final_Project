# Backend - Sistema de Gestión de Incapacidades y Recobros

Este proyecto está construido con **FastAPI** y usa **SQLAlchemy** con soporte asíncrono para interactuar con la base de datos PostgreSQL (Neon DB).

## Requisitos Previos

- Python 3.10 o superior.
- Git (para control de versiones).

## Inicialización y Configuración Local

Sigue estos pasos para correr el servidor del backend de forma local:

### 1. Activar el Entorno Virtual

Debemos operar siempre dentro de un entorno virtual aislado:

```bash
# Ubícate primero en la carpeta Backend
cd Backend

# Si no existe, crear el entorno virtual
python -m venv venv

# En Windows:
.\venv\Scripts\activate

# En Linux o Mac:
source venv/bin/activate
```

### 2. Instalación de Dependencias

Con el entorno activado, descarga las paqueterías del proyecto:

```bash
pip install -r requirements.txt
```

### 3. Configuración de Variables de Entorno (`.env`)

Asegúrate de que haya un archivo llamado `.env` en la raíz de la carpeta `Backend/` con esta estructura:

```env
DATABASE_URL=postgresql+asyncpg://<usuario>:<password>@<host>/<dbname>?ssl=require
SECRET_KEY=tu_super_secreto_aqui_para_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_BASE_URL=http://localhost:8000
```

> **Nota:** Este archivo no debe integrarse al control de versiones de Git debido a las políticas pautadas en nuestro archivo `.gitignore`.

### 4. Configuración en Producción (Render)

Cuando depliegues a Render, asegúrate de configurar estas variables de entorno en el dashboard:

- `DATABASE_URL`: Tu URL de Neon PostgreSQL
- `SECRET_KEY`: Una clave secreta fuerte (pode ser generada automáticamente por Render)
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
- **`API_BASE_URL`**: La URL completa de tu backend en Render (ej: `https://incapacidades-backend.onrender.com`)

Este último es **crítico** para que los archivos cargados se sirvan correctamente desde la URL absoluta del servidor.

### 5. Lanzar el Servidor Backend

Corre el script `uvicorn` que lanzará el servidor expuesto en el puerto 8000:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Una vez que la consola confirme que la aplicación ha iniciado (Uvicorn running on `http://0.0.0.0:8000`), podrás acceder a:

* **Punto de Entrada Local:** `http://localhost:8000/api/`
* **Documentación Interactiva (Swagger/OpenAPI):** `http://localhost:8000/docs`

---

## Estructura del Aplicativo y Rutas

* **`docs/`**: Contiene la documentación interna referente al flujo lógico de trabajo de este backend (`flujo_sistema_incapacidades.md`).
* **`app/`**: Toda la lógica central de la API (modelos, base de datos, routers, auth).
* **`render.yaml`**: Archivo listo para Infraestructura como Código (IaC) en la plataforma Render para un despliegue en la nube fluido.
