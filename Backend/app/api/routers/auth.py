from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
from app.core.database import get_db
from app.models.domain import Usuario
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.domain import Token, UsuarioCreate, UsuarioResponse
from app.core.config import settings

router = APIRouter()

@router.post("/registrar", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(user_in: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    """El sistema registra un nuevo usuario asignándole las credenciales mediante hash de forma segura."""
    try:
        result = await db.execute(select(Usuario).filter(Usuario.documento == user_in.documento))
        user_exists = result.scalars().first()
        if user_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El sistema advierte que ya existe un usuario con este documento."
            )
        
        hashed_pass = get_password_hash(user_in.password)
        nuevo_usuario = Usuario(
            documento=user_in.documento,
            nombre_completo=user_in.nombre_completo,
            email=user_in.email,
            hashed_password=hashed_pass,
            rol=user_in.rol
        )
        
        db.add(nuevo_usuario)
        await db.commit()
        await db.refresh(nuevo_usuario)
        
        return nuevo_usuario
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error al crear usuario: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """El sistema valida las credenciales del usuario y emite un token JWT."""
    result = await db.execute(select(Usuario).filter(Usuario.documento == form_data.username))
    user = result.scalars().first()
    
    # Check manual si el hash falla por estar quemado en DB para pruebas (sólo para dev rápido si es requerido)
    valid_pass = False
    if user:
        try:
            valid_pass = verify_password(form_data.password, user.hashed_password)
        except Exception:
            # Fallback simple
            valid_pass = (form_data.password == user.hashed_password)
    
    if not user or not valid_pass:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El sistema rechazó las credenciales, usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "rol": user.rol}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
