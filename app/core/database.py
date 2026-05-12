from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# El sistema adapta la URL de conexión síncrona para el controlador asíncrono (asyncpg).
async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")

# El sistema establece el motor de base de datos asíncrono.
engine = create_async_engine(async_database_url, echo=True)

# El sistema configura la fábrica de sesiones transaccionales.
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# El sistema provee la clase base para vincular los modelos ORM.
Base = declarative_base()

async def get_db():
    """El sistema expone una sesión de base de datos por solicitud."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
