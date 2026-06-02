from sqlalchemy import Column, Float, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    start_time = Column(Float, nullable=True)
    end_time = Column(Float, nullable=True)

    video_url = Column(String, nullable=True)

    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship(
        "Course",
        back_populates="modules"
    )