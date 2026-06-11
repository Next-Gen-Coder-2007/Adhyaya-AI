from pydantic import BaseModel, EmailStr
from typing import Optional

class Register(BaseModel):
    name: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    access_token: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserSettingsUpdate(BaseModel):
    darkMode: Optional[bool] = None
    themeColor: Optional[str] = None
    fontSize: Optional[str] = None
    layoutMode: Optional[str] = None