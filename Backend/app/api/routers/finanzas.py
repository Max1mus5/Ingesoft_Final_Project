from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.domain import Incapacidad, Usuario, RolEnum, EstadoIncapacidadEnum, HistorialEstadoIncapacidad
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
        raise HTTPException(
            status_code=403,
            detail=f"Solo administradores y personal de contabilidad pueden conciliar pagos. Tu rol actual es '{current_user.rol.value}'."
        )
        
    try:
        result = await db.execute(select(Incapacidad).filter(Incapacidad.id == conciliacion.incapacidad_id))
        incapacidad = result.scalars().first()
        
        if not incapacidad:
            raise HTTPException(
                status_code=404,
                detail=f"La incapacidad con ID '{conciliacion.incapacidad_id}' no existe en el sistema."
            )

        if incapacidad.estado not in [EstadoIncapacidadEnum.RADICADA, EstadoIncapacidadEnum.EN_MORA]:
            raise HTTPException(
                status_code=400,
                detail=f"No se puede conciliar una incapacidad en estado '{incapacidad.estado.value}'. Solo se pueden conciliar incapacidades en estado RADICADA o EN_MORA."
            )
            
        incapacidad.estado = EstadoIncapacidadEnum.PAGADA
        db.add(HistorialEstadoIncapacidad(
            incapacidad_id=incapacidad.id,
            estado=EstadoIncapacidadEnum.PAGADA,
        ))
        # El sistema guarda valor_pagado en registro contable (simulado)
        await db.commit()
        await db.refresh(incapacidad)
        
        return {
            "mensaje": f"El sistema ha conciliado el pago exitosamente. Valor pagado: ${conciliacion.valor_pagado:,.0f}",
            "incapacidad": IncapacidadResponse.model_validate(incapacidad)
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar conciliación: {str(e)}"
        )
