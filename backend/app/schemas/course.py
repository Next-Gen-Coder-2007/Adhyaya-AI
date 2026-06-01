from pydantic import BaseModel


class CourseCreate(BaseModel):
    title: str
    description: str
    image_url: str


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    user_id: int

    class Config:
        from_attributes = True