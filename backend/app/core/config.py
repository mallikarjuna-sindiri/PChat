from pydantic import BaseSettings


class Settings(BaseSettings):
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "ChatApp"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/chatapp"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def parse_cors_origins(raw_value: str) -> list[str]:
    return [item.strip() for item in raw_value.split(",") if item.strip()]
