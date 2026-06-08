from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum

class SectionType(str, Enum):
    VIDEO = "video"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    SUMMARY = "summary"

class QuizQuestion(BaseModel):
    question: str
    type: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str


class AssignmentTask(BaseModel):
    title: str
    description: str
    difficulty: str
    tasks: List[str] = Field(default_factory=list)
    evaluation_criteria: List[str] = Field(default_factory=list)


class Resource(BaseModel):
    title: str
    url: str
    description: Optional[str] = None


class SectionContent(BaseModel):
    video: Optional[str] = None
    quiz: Optional[List[QuizQuestion]] = None
    assignment: Optional[List[AssignmentTask]] = None
    summary: Optional[str] = None

    key_takeaways: List[str] = Field(default_factory=list)
    resources: List[Resource] = Field(default_factory=list)


class SectionBase(BaseModel):
    type: SectionType
    title: str
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    content: Optional[Any] = None
    completed: bool = False

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    type: Optional[SectionType] = None
    title: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    content: Optional[Any] = None
    completed: Optional[bool] = None


class SectionResponse(SectionBase):
    id: int
    module_id: int

    model_config = {
        "from_attributes": True
    }