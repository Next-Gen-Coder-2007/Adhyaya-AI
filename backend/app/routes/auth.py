from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import Register, Login, GoogleLogin, UserUpdate, UserSettingsUpdate
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
        "provider": current_user.provider,
        "settings": current_user.settings
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}

@router.put("/me")
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.id == current_user.id).first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if db_user.provider == "google":
        if data.email or data.password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Google users cannot update email or password. Only name is editable.",
            )

    if data.email and data.email != db_user.email:
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use",
            )

    if data.name:
        db_user.name = data.name

    if data.email:
        db_user.email = data.email

    if data.password:
        db_user.hashed_password = hash_password(data.password)

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "email": db_user.email,
            "name": db_user.name,
            "provider": db_user.provider,
        },
    }


@router.patch("/me/settings", response_model=dict)
def update_user_settings(
    settings: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    current_settings = dict(db_user.settings or {})

    if settings.darkMode is not None:
        current_settings["darkMode"] = settings.darkMode
    if settings.themeColor is not None:
        current_settings["themeColor"] = settings.themeColor
    if settings.fontSize is not None:
        current_settings["fontSize"] = settings.fontSize
    if settings.layoutMode is not None:
        current_settings["layoutMode"] = settings.layoutMode

    db_user.settings = current_settings
    db.commit()
    db.refresh(db_user)

    return {"message": "Settings updated successfully", "settings": db_user.settings}