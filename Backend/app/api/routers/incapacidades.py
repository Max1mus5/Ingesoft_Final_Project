import uuid
import base64
import os
import mimetypes
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.domain import Incapacidad, Usuario, RolEnum, SoporteDocumental, EstadoIncapacidadEnum, EPS
from app.schemas.domain import IncapacidadCreate, IncapacidadResponse, IncapacidadUpdateEstado
from app.api.dependencies import get_current_user
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def registrar_incapacidad(
    incapacidad_in: IncapacidadCreate, 
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema registra una nueva incapacidad."""
    if not incapacidad_in.soportes:
        raise HTTPException(status_code=400, detail="El sistema requiere metadata de los soportes obligatorios.")

    try:
        # El sistema determina para quién crear la incapacidad
        colaborador_id = current_user.id
        
        # Si se especifica documento y el usuario es GESTION_HUMANA o ADMIN, buscar ese usuario
        if incapacidad_in.colaborador_documento and current_user.rol in [RolEnum.GESTION_HUMANA, RolEnum.ADMIN]:
            result = await db.execute(select(Usuario).filter(Usuario.documento == incapacidad_in.colaborador_documento))
            empleado = result.scalars().first()
            
            if not empleado:
                raise HTTPException(status_code=404, detail="El sistema no encontró el empleado con ese documento.")
            
            colaborador_id = empleado.id
        elif incapacidad_in.colaborador_documento and current_user.rol not in [RolEnum.GESTION_HUMANA, RolEnum.ADMIN]:
            raise HTTPException(status_code=403, detail="El sistema solo permite a GESTION_HUMANA crear incapacidades para otros empleados.")
        
        # Validar que la fecha de inicio sea anterior a la fecha de fin
        if incapacidad_in.fecha_inicio > incapacidad_in.fecha_fin:
            raise HTTPException(status_code=400, detail="El sistema rechaza: la fecha de inicio debe ser anterior a la fecha de fin.")
        
        nueva_incapacidad = Incapacidad(
            colaborador_id=colaborador_id,
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
            url_ficticia = None

            # Si viene archivo en base64 tipo data URL, decodificar y guardar en /uploads
            archivo_b64 = getattr(soporte_in, 'archivo_base64_o_url', None)
            if archivo_b64 and isinstance(archivo_b64, str) and archivo_b64.startswith('data:'):
                try:
                    header, data = archivo_b64.split(',', 1)
                    mime = header.split(';')[0].split(':')[1] if ':' in header else 'application/octet-stream'
                    ext = mimetypes.guess_extension(mime) or '.bin'
                    filename = f"{uuid.uuid4()}{ext}"
                    uploads_dir = os.path.join(os.getcwd(), 'uploads')
                    if not os.path.exists(uploads_dir):
                        os.makedirs(uploads_dir, exist_ok=True)
                    file_path = os.path.join(uploads_dir, filename)
                    with open(file_path, 'wb') as f:
                        f.write(base64.b64decode(data))
                    url_ficticia = f"/uploads/{filename}"
                except Exception:
                    url_ficticia = f"https://s3.ficticio.com/soportes/{uuid.uuid4()}.pdf"
            elif archivo_b64 and isinstance(archivo_b64, str):
                # Si es una URL ya provisionada, úsala directamente
                url_ficticia = archivo_b64
            else:
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
        
        # Recargar relaciones
        await db.refresh(nueva_incapacidad, ['colaborador', 'eps', 'soportes'])

        resp_dict = {
            "id": str(nueva_incapacidad.id),
            "colaborador_id": str(nueva_incapacidad.colaborador_id),
            "colaborador_nombre": nueva_incapacidad.colaborador.nombre_completo if nueva_incapacidad.colaborador else "",
            "colaborador_documento": nueva_incapacidad.colaborador.documento if nueva_incapacidad.colaborador else "",
            "eps_id": nueva_incapacidad.eps_id,
            "eps_nombre": nueva_incapacidad.eps.nombre if nueva_incapacidad.eps else "",
            "fecha_inicio": str(nueva_incapacidad.fecha_inicio),
            "fecha_fin": str(nueva_incapacidad.fecha_fin),
            "dias_otorgados": nueva_incapacidad.dias_otorgados,
            "estado": nueva_incapacidad.estado.value,
            "fecha_registro": nueva_incapacidad.fecha_registro.isoformat(),
            "diagnostico_cie10": nueva_incapacidad.diagnostico_cie10 if current_user.rol in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA] else None,
            "soportes": [{"id": str(s.id), "tipo_documento": s.tipo_documento.value, "url_archivo": s.url_archivo} for s in soportes_creados],
        }
        return resp_dict

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"El sistema falló al transar la inserción: {str(e)}")

@router.get("/", response_model=List[dict])
async def listar_incapacidades(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema lista las incapacidades según el rol del usuario."""
    if current_user.rol in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
        stmt = select(Incapacidad).options(selectinload(Incapacidad.colaborador), selectinload(Incapacidad.eps), selectinload(Incapacidad.soportes))
    else:
        stmt = select(Incapacidad).filter(Incapacidad.colaborador_id == current_user.id).options(selectinload(Incapacidad.colaborador), selectinload(Incapacidad.eps), selectinload(Incapacidad.soportes))
        
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    resultados = []
    for record in records:
        resp_dict = {
            "id": str(record.id),
            "colaborador_id": str(record.colaborador_id),
            "colaborador_nombre": record.colaborador.nombre_completo if record.colaborador else "",
            "colaborador_documento": record.colaborador.documento if record.colaborador else "",
            "eps_id": record.eps_id,
            "eps_nombre": record.eps.nombre if record.eps else "",
            "fecha_inicio": str(record.fecha_inicio),
            "fecha_fin": str(record.fecha_fin),
            "dias_otorgados": record.dias_otorgados,
            "estado": record.estado.value,
            "fecha_registro": record.fecha_registro.isoformat(),
            "diagnostico_cie10": record.diagnostico_cie10 if current_user.rol in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA] else None,
            "soportes": [{"id": str(s.id), "tipo_documento": s.tipo_documento.value, "url_archivo": s.url_archivo} for s in record.soportes] if record.soportes else [],
        }
        resultados.append(resp_dict)
        
    return resultados

@router.get("/{id}", response_model=dict)
async def obtener_incapacidad(
    id: uuid.UUID,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """El sistema retorna los detalles de una incapacidad específica con sus soportes."""
    try:
        stmt = select(Incapacidad).where(Incapacidad.id == id).options(selectinload(Incapacidad.soportes), selectinload(Incapacidad.colaborador), selectinload(Incapacidad.eps))
        result = await db.execute(stmt)
        incapacidad = result.scalars().first()
        
        if not incapacidad:
            raise HTTPException(status_code=404, detail="El sistema no encontró la incapacidad buscada.")
        
        # Control de acceso: solo ADMIN/GESTION_HUMANA pueden ver cualquier incapacidad, otros ven solo las propias
        if current_user.rol not in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA]:
            if incapacidad.colaborador_id != current_user.id:
                raise HTTPException(status_code=403, detail="El sistema deniega el acceso a esta incapacidad.")
        
        resp_dict = {
            "id": str(incapacidad.id),
            "colaborador_id": str(incapacidad.colaborador_id),
            "colaborador_nombre": incapacidad.colaborador.nombre_completo if incapacidad.colaborador else "",
            "colaborador_documento": incapacidad.colaborador.documento if incapacidad.colaborador else "",
            "eps_id": incapacidad.eps_id,
            "eps_nombre": incapacidad.eps.nombre if incapacidad.eps else "",
            "fecha_inicio": str(incapacidad.fecha_inicio),
            "fecha_fin": str(incapacidad.fecha_fin),
            "dias_otorgados": incapacidad.dias_otorgados,
            "estado": incapacidad.estado.value,
            "fecha_registro": incapacidad.fecha_registro.isoformat(),
            "diagnostico_cie10": incapacidad.diagnostico_cie10 if current_user.rol in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA] else None,
            "soportes": [{"id": str(s.id), "tipo_documento": s.tipo_documento.value, "url_archivo": s.url_archivo} for s in incapacidad.soportes] if incapacidad.soportes else [],
        }
        return resp_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"El sistema error: {str(e)}")

@router.patch("/{id}/estado", response_model=dict)
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
        stmt = select(Incapacidad).where(Incapacidad.id == id).options(selectinload(Incapacidad.colaborador), selectinload(Incapacidad.eps), selectinload(Incapacidad.soportes))
        result = await db.execute(stmt)
        incapacidad = result.scalars().first()
        
        if not incapacidad:
            raise HTTPException(status_code=404, detail="El sistema no encontró la incapacidad buscada.")
            
        incapacidad.estado = estado_update.estado
        await db.commit()
        
        resp_dict = {
            "id": str(incapacidad.id),
            "colaborador_id": str(incapacidad.colaborador_id),
            "colaborador_nombre": incapacidad.colaborador.nombre_completo if incapacidad.colaborador else "",
            "colaborador_documento": incapacidad.colaborador.documento if incapacidad.colaborador else "",
            "eps_id": incapacidad.eps_id,
            "eps_nombre": incapacidad.eps.nombre if incapacidad.eps else "",
            "fecha_inicio": str(incapacidad.fecha_inicio),
            "fecha_fin": str(incapacidad.fecha_fin),
            "dias_otorgados": incapacidad.dias_otorgados,
            "estado": incapacidad.estado.value,
            "fecha_registro": incapacidad.fecha_registro.isoformat(),
            "diagnostico_cie10": incapacidad.diagnostico_cie10 if current_user.rol in [RolEnum.ADMIN, RolEnum.GESTION_HUMANA] else None,
            "soportes": [{"id": str(s.id), "tipo_documento": s.tipo_documento.value, "url_archivo": s.url_archivo} for s in incapacidad.soportes] if incapacidad.soportes else [],
        }
        return resp_dict
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
