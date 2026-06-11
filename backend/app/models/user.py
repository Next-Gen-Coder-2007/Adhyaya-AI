from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    hashed_password = Column(String, nullable=True)
    provider = Column(String, default="local")

    settings = Column(JSON, default={
        "darkMode": True,
        "themeColor": "amber",
        "fontSize": "medium",
        "layoutMode": "grid"
    })


    courses = relationship("Course", back_populates="owner")