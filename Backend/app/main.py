from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import alertas, auth, incapacidades
from app.core.database import engine, Base
from app.api.routers import finanzas

# El sistema inicializa la instancia API bajo los estándares REST.
app = FastAPI(
    title="Sistema Integral de Gestión de Incapacidades y Recobros",
    description="Backend encargado de la administración de incapacidades y trazabilidad (ACID)",
    version="1.0.0"
)

# El sistema configura CORS para permitir peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ingesoft-final-project.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(incapacidades.router, prefix="/api/incapacidades", tags=["Incapacidades (Procesos Core)"])
app.include_router(alertas.router, prefix="/api/alertas", tags=["Alertas y Tiempos"])
app.include_router(finanzas.router, prefix="/api/finanzas", tags=["Finanzas"])

@app.on_event("startup")
async def startup_event():
    """El sistema inyecta la estructura relacional a base de datos en instancias de desarrollo/testeo."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root_status():
    """El sistema expone un punto de verificación de vida del servicio básico."""
    return {"status": "El sistema FastAPI se encuentra operativo y a la escucha."}