from pydantic import BaseModel

class Register(BaseModel):
    name: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    access_token: str