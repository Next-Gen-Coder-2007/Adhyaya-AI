from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p): return pwd_context.hash(p)

def verify_password(p, h): return pwd_context.verify(p, h)

def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=7)

    secret = os.getenv("SECRET_KEY", "adhyaya_ai_super_secret_jwt_key_2026")
    algorithm = os.getenv("ALGORITHM", "HS256")
    return jwt.encode(payload, secret, algorithm=algorithm)