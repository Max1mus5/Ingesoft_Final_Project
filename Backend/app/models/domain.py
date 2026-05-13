import uuid
from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class RolEnum(str, enum.Enum):
    """El sistema estandariza los roles de acceso requeridos por seguridad."""
    ADMIN = "ADMIN"
    GESTION_HUMANA = "GESTION_HUMANA"
    CONTABILIDAD = "CONTABILIDAD"
    COLABORADOR = "COLABORADOR"

class Usuario(Base):
    """El sistema representa la identidad del usuario y sus credenciales."""
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documento = Column(String, unique=True, index=True, nullable=False)
    nombre_completo = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    rol = Column(Enum(RolEnum), nullable=False)
    activo = Column(Boolean, default=True)

class EPS(Base):
    """El sistema almacena las entidades prestadoras y sus parámetros operativos."""
    __tablename__ = "eps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    dias_limite_radicacion = Column(Integer, nullable=False)

class EstadoIncapacidadEnum(str, enum.Enum):
    """El sistema define las etapas del ciclo de vida de la incapacidad médica."""
    REGISTRADA = "REGISTRADA"
    TRANSCRITA = "TRANSCRITA"
    RADICADA = "RADICADA"
    EN_MORA = "EN_MORA"
    PAGADA = "PAGADA"
    GLOSADA = "GLOSADA"
    ARCHIVADA = "ARCHIVADA"

class Incapacidad(Base):
    """El sistema unifica la información del evento médico (Núcleo de negocio)."""
    __tablename__ = "incapacidades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    colaborador_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    eps_id = Column(Integer, ForeignKey("eps.id"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    dias_otorgados = Column(Integer, nullable=False)
    estado = Column(Enum(EstadoIncapacidadEnum), default=EstadoIncapacidadEnum.REGISTRADA, nullable=False)
    fecha_registro = Column(DateTime, default=datetime.utcnow, nullable=False)
    diagnostico_cie10 = Column(String, nullable=False)

    # El sistema establece las relaciones referenciales ORM.
    colaborador = relationship("Usuario")
    eps = relationship("EPS")
    soportes = relationship("SoporteDocumental", back_populates="incapacidad")

class TipoSoporteEnum(str, enum.Enum):
    """El sistema categoriza los tipos de archivos clínicos soportados."""
    EPICRISIS = "EPICRISIS"
    HISTORIA_CLINICA = "HISTORIA_CLINICA"
    CERTIFICADO = "CERTIFICADO"
    FURIPS = "FURIPS"

class SoporteDocumental(Base):
    """El sistema traza los vínculos a los documentos asigandos, simulando el almacenamiento."""
    __tablename__ = "soportes_documentales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incapacidad_id = Column(UUID(as_uuid=True), ForeignKey("incapacidades.id"), nullable=False)
    tipo_documento = Column(Enum(TipoSoporteEnum), nullable=False)
    url_archivo = Column(String, nullable=False)

    incapacidad = relationship("Incapacidad", back_populates="soportes")
