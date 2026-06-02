# app/schemas/module.py
from pydantic import BaseModel

class ModuleResponse(BaseModel):
    id: int
    title: str
    start_time: float | None = None
    end_time: float | None = None
    video_url: str | None = None

    class Config:
        from_attributes = True