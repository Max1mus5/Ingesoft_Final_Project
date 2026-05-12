from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from Backend.Backend.app.core.database import get_db
from Backend.Backend.app.models.domain import Incapacidad, Usuario, RolEnum, EstadoIncapacidadEnum, EPS
from Backend.Backend.app.schemas.domain import IncapacidadResponse
from Backend.Backend.app.api.dependencies import get_current_user
from datetime import datetime, date

router = APIRouter()

@router.get("/vencimientos")
async def obtener_alertas_vencimiento(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema calcula y retorna incapacidades RADICADAS por vencer."""
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
        raise HTTPException(status_code=403, detail="El sistema deniega esta operación.")
    
    # Trae todas las radicadas
    stmt = select(Incapacidad, EPS).join(EPS, Incapacidad.eps_id == EPS.id).filter(Incapacidad.estado == EstadoIncapacidadEnum.RADICADA)
    result = await db.execute(stmt)
    records = result.all()
    
    alertas = []
    hoy = date.today()
    for inc, eps in records:
        # Aquí se asume lógica simplificada basada en limite_radicacion: el sistema calcula tiempo
        dias_pasados = (hoy - inc.fecha_inicio).days
        dias_restantes = eps.dias_limite_radicacion - dias_pasados
        
        if dias_restantes <= 30:
            resp = IncapacidadResponse.model_validate(inc)
            alertas.append({
                "incapacidad": resp,
                "dias_restantes_limite": dias_restantes,
                "eps": eps.nombre
            })
            
    return alertas
