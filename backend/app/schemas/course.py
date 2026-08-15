from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.module import ModuleResponse


class CourseCreate(BaseModel):
    title: str
    description: str
    image_url: str
    video_url: str
    is_playlist: bool = False
    status: str = "generating"


class CourseNotesUpdate(BaseModel):
    notes: str


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    is_playlist: bool = False
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    modules: List[ModuleResponse] = []

    class Config:
        from_attributes = True