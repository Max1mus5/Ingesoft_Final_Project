from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.domain import Usuario, RolEnum
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list)
async def listar_usuarios(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema lista todos los usuarios registrados (solo para ADMIN)."""
    # Validar que el usuario tenga rol ADMIN
    if current_user.rol != RolEnum.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="El sistema deniega esta operación: solo administradores pueden ver la lista de colaboradores."
        )
    
    try:
        # Obtener todos los usuarios ordenados por nombre
        stmt = select(Usuario).order_by(Usuario.nombre_completo)
        result = await db.execute(stmt)
        usuarios = result.scalars().all()
        
        # Formatear respuesta
        usuarios_response = [
            {
                "id": str(usuario.id),
                "documento": usuario.documento,
                "nombre_completo": usuario.nombre_completo,
                "email": usuario.email,
                "rol": usuario.rol.value,
                "activo": usuario.activo,
                "fecha_creacion": usuario.fecha_creacion.isoformat() if usuario.fecha_creacion else None,
            }
            for usuario in usuarios
        ]
        
        return usuarios_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"El sistema error al listar usuarios: {str(e)}"
        )
