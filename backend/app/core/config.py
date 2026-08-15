import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Adhyaya AI"
    VERSION: str = "2.1.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "adhyaya_ai_super_secret_jwt_key_2026_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", 10))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", 20))

    # AI & Services
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    GOOGLE_URL: str = os.getenv("GOOGLE_URL", "https://www.googleapis.com/oauth2/v3/userinfo")

    # CORS
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        default_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://localhost:4173",
        ]
        env_origins = os.getenv("ALLOWED_ORIGINS", "")
        if env_origins:
            custom = [o.strip() for o in env_origins.split(",") if o.strip()]
            return list(set(default_origins + custom))
        return default_origins


settings = Settings()
