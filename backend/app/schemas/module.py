from typing import List
from app.schemas.section import SectionResponse
from pydantic import BaseModel

class ModuleResponse(BaseModel):
    id: int
    title: str
    start_time: float | None = None
    end_time: float | None = None
    video_url: str | None = None
    sections: List[SectionResponse] = []

    class Config:
        from_attributes = True