# backend/app/models/chunk.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base

class CourseChunk(Base):
    __tablename__ = "course_chunks"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)
    module_title = Column(String)
    section_type = Column(String)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(1536))

    course = relationship("Course", back_populates="chunks")