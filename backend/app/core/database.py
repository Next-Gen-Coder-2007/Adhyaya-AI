from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# 1. Normalize postgres:// to postgresql:// for SQLAlchemy compatibility
if raw_db_url and raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# 2. Configure dialect-specific engine parameters
is_sqlite = raw_db_url.startswith("sqlite")

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if is_sqlite:
    connect_args["check_same_thread"] = False
else:
    # Production database pool settings
    engine_kwargs.update({
        "pool_size": int(os.getenv("DB_POOL_SIZE", 10)),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", 20)),
        "pool_recycle": 1800,
    })

engine = create_engine(raw_db_url, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()