from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    youtube_url = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="processing")
    is_playlist = Column(Boolean, default=False)  # Default to False
    chunks = relationship("Chunk", back_populates="course")
    owner = relationship("User", back_populates="courses")
    modules = relationship(
        "Module",
        back_populates="course",
        cascade="all, delete"
    )