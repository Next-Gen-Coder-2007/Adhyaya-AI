from pydantic import BaseModel


class CourseCreate(BaseModel):
    title: str
    description: str
    image_url: str
    youtube_url: str
    status: str


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    youtube_url: str
    status: str

    class Config:
        from_attributes = True