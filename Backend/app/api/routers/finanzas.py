from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.domain import Incapacidad, Usuario, RolEnum, EstadoIncapacidadEnum
from app.schemas.domain import FinanzasConciliar, IncapacidadResponse
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/conciliar")
async def conciliar_pago(
    conciliacion: FinanzasConciliar,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema procesa el pago recibido y actualiza la incapacidad a PAGADA."""
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.CONTABILIDAD]:
        raise HTTPException(status_code=403, detail="El sistema requiere rol contable.")
        
    try:
        result = await db.execute(select(Incapacidad).filter(Incapacidad.id == conciliacion.incapacidad_id))
        incapacidad = result.scalars().first()
        
        if not incapacidad:
            raise HTTPException(status_code=404, detail="El sistema no encontró la incapacidad.")
            
        incapacidad.estado = EstadoIncapacidadEnum.PAGADA
        # El sistema guarda valor_pagado en registro contable (simulado)
        await db.commit()
        await db.refresh(incapacidad)
        
        return {
            "mensaje": "El sistema ha conciliado el pago exitosamente.",
            "incapacidad": IncapacidadResponse.model_validate(incapacidad)
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"El sistema falló al conciliar: {str(e)}")
