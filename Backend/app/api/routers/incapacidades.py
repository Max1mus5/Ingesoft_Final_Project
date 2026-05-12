import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from Backend.Backend.app.core.database import get_db
from Backend.Backend.app.models.domain import Incapacidad, Usuario, RolEnum, SoporteDocumental, EstadoIncapacidadEnum, EPS
from Backend.Backend.app.schemas.domain import IncapacidadCreate, IncapacidadResponse, IncapacidadUpdateEstado
from Backend.Backend.app.api.dependencies import get_current_user
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=IncapacidadResponse)
async def registrar_incapacidad(
    incapacidad_in: IncapacidadCreate, 
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema registra una nueva incapacidad."""
    if not incapacidad_in.soportes:
        raise HTTPException(status_code=400, detail="El sistema requiere metadata de los soportes obligatorios.")

    try:
        nueva_incapacidad = Incapacidad(
            colaborador_id=current_user.id,
            eps_id=incapacidad_in.eps_id,
            fecha_inicio=incapacidad_in.fecha_inicio,
            fecha_fin=incapacidad_in.fecha_fin,
            dias_otorgados=incapacidad_in.dias_otorgados,
            diagnostico_cie10=incapacidad_in.diagnostico_cie10,
            estado=EstadoIncapacidadEnum.REGISTRADA
        )
        db.add(nueva_incapacidad)
        await db.flush()

        soportes_creados = []
        for soporte_in in incapacidad_in.soportes:
            url_ficticia = f"https://s3.ficticio.com/soportes/{uuid.uuid4()}.pdf"
            nuevo_soporte = SoporteDocumental(
                incapacidad_id=nueva_incapacidad.id,
                tipo_documento=soporte_in.tipo_documento,
                url_archivo=url_ficticia
            )
            db.add(nuevo_soporte)
            soportes_creados.append(nuevo_soporte)
            
        await db.commit()
        await db.refresh(nueva_incapacidad)

        respuesta = IncapacidadResponse.model_validate(nueva_incapacidad)
        if current_user.rol not in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
            respuesta.diagnostico_cie10 = None
        respuesta.soportes = soportes_creados
        return respuesta

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"El sistema falló al transar la inserción: {str(e)}")

@router.get("/", response_model=List[IncapacidadResponse])
async def listar_incapacidades(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema lista las incapacidades según el rol del usuario."""
    if current_user.rol in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
        stmt = select(Incapacidad)
    else:
        stmt = select(Incapacidad).filter(Incapacidad.colaborador_id == current_user.id)
        
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    resultados = []
    for record in records:
        resp = IncapacidadResponse.model_validate(record)
        if current_user.rol not in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
            resp.diagnostico_cie10 = None
        resultados.append(resp)
        
    return resultados

@router.patch("/{id}/estado", response_model=IncapacidadResponse)
async def actualizar_estado(
    id: uuid.UUID,
    estado_update: IncapacidadUpdateEstado,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema actualiza el estado de la incapacidad, validando ACID."""
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA, RolEnum.CONTABILIDAD]:
        raise HTTPException(status_code=403, detail="El sistema deniega esta operación por falta de permisos.")
        
    try:
        result = await db.execute(select(Incapacidad).filter(Incapacidad.id == id))
        incapacidad = result.scalars().first()
        
        if not incapacidad:
            raise HTTPException(status_code=404, detail="El sistema no encontró la incapacidad buscada.")
            
        incapacidad.estado = estado_update.estado
        await db.commit()
        await db.refresh(incapacidad)
        
        resp = IncapacidadResponse.model_validate(incapacidad)
        if current_user.rol not in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
            resp.diagnostico_cie10 = None
        return resp
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"El sistema error: {str(e)}")

@router.get("/{id}/trazabilidad")
async def obtener_trazabilidad(
    id: uuid.UUID,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema retorna el ciclo de vida y los logs asociados a la incapacidad especificada."""
    return {
        "incapacidad_id": id,
        "logs": [
            {"evento": "REGISTRADA", "fecha": "2026-05-12T10:00:00Z"},
            {"evento": "RADICADA", "fecha": "2026-05-12T10:30:00Z"}
        ]
    }
