from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    provider = Column(String, default="local")
    created_at = Column(DateTime, default=datetime.utcnow)

    settings = Column(JSON, default={
        "darkMode": True,
        "themeColor": "amber",
        "fontSize": "medium",
        "layoutMode": "grid"
    })

    courses = relationship("Course", back_populates="owner", cascade="all, delete-orphan")