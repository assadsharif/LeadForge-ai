from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    AI_API_KEY: str = ""
    AI_API_TIMEOUT: int = 30
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()  # type: ignore[call-arg]
