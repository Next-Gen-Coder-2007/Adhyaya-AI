from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    title = Column(String)
    start_time = Column(Float, nullable=True)
    end_time = Column(Float, nullable=True)
    content = Column(JSON)
    completed = Column(Boolean, default=False)
    quiz_score = Column(Integer, nullable=True)
    quiz_answers = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    module_id = Column(Integer, ForeignKey("modules.id"))
    module = relationship("Module", back_populates="sections")