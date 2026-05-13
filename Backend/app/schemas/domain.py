from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from app.models.domain import RolEnum, EstadoIncapacidadEnum, TipoSoporteEnum

# Esquemas de Usuario
class UsuarioBase(BaseModel):
    """El sistema define la base de datos de los usuarios."""
    documento: str
    nombre_completo: str
    email: str
    rol: RolEnum

class UsuarioCreate(UsuarioBase):
    """El sistema recibe los datos de ingreso junto a una contraseÃ±a en plano."""
    password: str

class UsuarioResponse(UsuarioBase):
    """El sistema define la respuesta estándar para la entidad Usuario."""
    id: UUID
    activo: bool
    
    model_config = ConfigDict(from_attributes=True)

# Esquemas de EPS
class EPSResponse(BaseModel):
    """El sistema define la respuesta para la entidad EPS."""
    id: int
    nombre: str
    dias_limite_radicacion: int

    model_config = ConfigDict(from_attributes=True)

# Esquemas de Soporte
class SoporteDocumentalCreate(BaseModel):
    """El sistema define los campos para simular la subida del soporte documental."""
    tipo_documento: TipoSoporteEnum
    archivo_base64_o_url: str 

class SoporteDocumentalResponse(BaseModel):
    id: UUID
    tipo_documento: TipoSoporteEnum
    url_archivo: str

    model_config = ConfigDict(from_attributes=True)

# Esquemas de Incapacidad
class IncapacidadCreate(BaseModel):
    """El sistema define la carga útil para registrar una incapacidad."""
    eps_id: int
    fecha_inicio: date
    fecha_fin: date
    dias_otorgados: int
    diagnostico_cie10: str
    soportes: List[SoporteDocumentalCreate]

class IncapacidadUpdateEstado(BaseModel):
    """El sistema define el payload para el cambio de estado."""
    estado: EstadoIncapacidadEnum

class IncapacidadResponse(BaseModel):
    """El sistema define la respuesta de una incapacidad, filtrando CIE10 si es necesario a nivel de endpoint."""
    id: UUID
    colaborador_id: UUID
    eps_id: int
    fecha_inicio: date
    fecha_fin: date
    dias_otorgados: int
    estado: EstadoIncapacidadEnum
    fecha_registro: datetime
    diagnostico_cie10: Optional[str] = None # El sistema oculta este campo si no hay rol adecuado
    soportes: List[SoporteDocumentalResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Esquemas de Token
class Token(BaseModel):
    """El sistema define el modelo de token con información del usuario."""
    access_token: str
    token_type: str
    user: 'UsuarioResponse'

class FinanzasConciliar(BaseModel):
    """El sistema define el payload para conciliación financiera."""
    incapacidad_id: UUID
    valor_pagado: float
