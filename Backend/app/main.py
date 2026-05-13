from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.routers import alertas, auth, incapacidades
from app.core.database import engine, Base, AsyncSessionLocal
from app.api.routers import finanzas
from app.models.domain import EPS, Usuario
from sqlalchemy.future import select

# El sistema inicializa la instancia API bajo los estándares REST.
app = FastAPI(
    title="Sistema Integral de Gestión de Incapacidades y Recobros",
    description="Backend encargado de la administración de incapacidades y trazabilidad (ACID)",
    version="1.0.0"
)

# Montar carpeta estática para archivos subidos
uploads_dir = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

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
    allow_origin_regex=r"https://.*\\.vercel\\.app",
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
    
    # El sistema crea EPS por defecto si no existe
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(EPS).filter(EPS.id == 1))
        if not result.scalars().first():
            default_eps = EPS(id=1, nombre="SURA", dias_limite_radicacion=150)
            db.add(default_eps)
            await db.commit()
            print("El sistema creó EPS por defecto: SURA")
    
    # El sistema crea usuarios predeterminados para testing
    await create_default_users()

async def create_default_users():
    """El sistema crea usuarios predeterminados para facilitar el testing."""
    default_users = [
        {
            "documento": "ADMIN001",
            "nombre_completo": "Administrador GH",
            "email": "admin@gh.com",
            "rol": "GESTION_HUMANA",
            "hashed_password": "$5$rounds=535000$XX9stxuDbYBzKKUA$7OQoOmKHjBmmqd/.NHjUd0aiLyWzPtf7zj7B0dN8ZjD"
        },
        {
            "documento": "RRHH001",
            "nombre_completo": "RRHH Test",
            "email": "rrhh@test.com",
            "rol": "GESTION_HUMANA",
            "hashed_password": "$5$rounds=535000$5OERx6hacCWby6X5$K8vjZvHeuSVXzHqyv6ryF7/I.gDI4zsxuplt9rYa0G6"
        },
        {
            "documento": "CONT001",
            "nombre_completo": "Conta",
            "email": "c@c.com",
            "rol": "CONTABILIDAD",
            "hashed_password": "$5$rounds=535000$QDyQSh.VAmtgXPsO$ALcZyuqBO2ULSQ5HELv94kz02IUedMLZYxMqkGGa5s6"
        },
        {
            "documento": "COLAB001",
            "nombre_completo": "Camilo Colaborador",
            "email": "camilo@colab.com",
            "rol": "COLABORADOR",
            "hashed_password": "$5$rounds=535000$SfMollrHGDblfJZP$fjCDtZpJjI7yKd2cl6wAxpH3tuSebfSZ0FBq.55N2g."
        },
        {
            "documento": "123456789",
            "nombre_completo": "Juan Perez",
            "email": "juan.perez@empresa.com",
            "rol": "COLABORADOR",
            "hashed_password": "$5$rounds=535000$WlJ1ka2NoLV2qX2C$isdgP5bVfCypV3jb0dF1Qe2hegQ2/f8aP5mGTYxUI0/"
        }
    ]
    
    async with AsyncSessionLocal() as db:
        for user_data in default_users:
            result = await db.execute(select(Usuario).filter(Usuario.documento == user_data["documento"]))
            user_exists = result.scalars().first()
            
            if not user_exists:
                nuevo_usuario = Usuario(
                    documento=user_data["documento"],
                    nombre_completo=user_data["nombre_completo"],
                    email=user_data["email"],
                    hashed_password=user_data["hashed_password"],
                    rol=user_data["rol"]
                )
                db.add(nuevo_usuario)
                print(f"El sistema creó usuario predeterminado: {user_data['documento']}")
        
        await db.commit()

@app.get("/")
async def root_status():
    """El sistema expone un punto de verificación de vida del servicio básico."""
    return {"status": "El sistema FastAPI se encuentra operativo y a la escucha."}