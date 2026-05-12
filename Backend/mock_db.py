import asyncio
import sys
import os

# Agregamos la ruta base para que los mÃ³dulos se resuelvan como "app.xxx"
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.domain import EPS
from sqlalchemy.future import select

async def mock_eps():
    """El sistema inyecta un maestro de EPS directamente en la base de datos para habilitar el motor."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(EPS).filter(EPS.id == 1))
        eps = result.scalars().first()
        if not eps:
            nueva_eps = EPS(id=1, nombre="SURA", dias_limite_radicacion=150)
            db.add(nueva_eps)
            await db.commit()
            print("El sistema inyecta la EPS 'SURA' con ID 1 en PostgreSQL.")
        else:
            print("El sistema detecta que la EPS ya existe.")

if __name__ == "__main__":
    asyncio.run(mock_eps())