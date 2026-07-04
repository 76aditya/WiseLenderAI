from pathlib import Path
from pydantic import Field, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

class Settings(BaseSettings):
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")
    DATABASE_URL: str = Field("postgresql+psycopg://postgres:postgres@localhost:5432/wiselender", env="DATABASE_URL")
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    RABBITMQ_URL: str = Field("amqp://guest:guest@localhost:5672//", env="RABBITMQ_URL")
    ML_SERVICE_URL: HttpUrl = Field("http://localhost:8000/predict", env="ML_SERVICE_URL")
    JWT_SECRET_KEY: str = Field("supersecretchangeme", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60 * 24, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    BCRYPT_ROUNDS: int = Field(12, env="BCRYPT_ROUNDS")
    REDIS_CACHE_TTL_SECONDS: int = Field(86400, env="REDIS_CACHE_TTL_SECONDS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
