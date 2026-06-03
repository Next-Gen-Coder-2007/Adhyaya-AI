from pydantic import BaseModel
from typing import List
from app.schemas.module import ModuleResponse


class CourseCreate(BaseModel):
    title: str
    description: str
    image_url: str
    youtube_url: str
    is_playlist: bool = False
    status: str


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    youtube_url: str
    status: str
    modules: List[ModuleResponse] = []

    class Config:
        from_attributes = True