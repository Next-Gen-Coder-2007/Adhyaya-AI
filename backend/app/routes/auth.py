from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import Register, Login, GoogleLogin
from app.core.security import hash_password, verify_password, create_token
from app.utils.google import verify_google
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(data: Register, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        provider="local"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Registered successfully"}


@router.post("/login")
def login(data: Login, response: Response, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user :
        raise HTTPException(status_code=404, detail="User Not Found")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    token = create_token({"sub": user.email})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False
    )

    return {"message": "Login success"}


@router.post("/google")
async def google_login(data: GoogleLogin, response: Response, db: Session = Depends(get_db)):

    user_info = await verify_google(data.access_token)

    email = user_info["email"]
    name = user_info.get("name", "Google User")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            name=name,
            email=email,
            provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_token({"sub": user.email})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False
    )

    return {"message": "Google login success"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "name": current_user.name,
        "provider": current_user.provider
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}