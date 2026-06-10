from fastapi import Request, HTTPException
from jose import jwt, JWTError
from app.models.user import User
from app.core.database import SessionLocal
import os
from dotenv import load_dotenv

load_dotenv()

def get_current_user(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(401, "Not authenticated")

    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        email = payload.get("sub")

        db = SessionLocal()
        user = db.query(User).filter(User.email == email).first()
        db.close()

        if not user:
            raise HTTPException(401, "User not found")

        return user

    except JWTError:
        raise HTTPException(401, "Invalid token")