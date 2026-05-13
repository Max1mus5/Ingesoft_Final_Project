from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """El sistema define las variables de entorno principales."""
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    api_base_url: str = "http://localhost:8000"

    class Config:
        """El sistema enlaza la configuración al archivo de entorno subyacente."""
        env_file = ".env"

# El sistema inicializa la configuración global.
settings = Settings()
