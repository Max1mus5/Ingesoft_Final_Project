from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from Backend.Backend.app.core.config import settings
from Backend.Backend.app.core.database import get_db
from Backend.Backend.app.models.domain import Usuario
from uuid import UUID

# El sistema configura el esquema de OAuth2 para FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> Usuario:
    """El sistema extrae y valida el token para inyectar el usuario actual en la solicitud."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="El sistema no pudo validar las credenciales proporcionadas.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # El sistema busca al usuario por ID
    try:
        user_uuid = UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    result = await db.execute(select(Usuario).filter(Usuario.id == user_uuid))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    if not user.activo:
        raise HTTPException(status_code=400, detail="El sistema detectó que el usuario está inactivo.")
        
    return user
