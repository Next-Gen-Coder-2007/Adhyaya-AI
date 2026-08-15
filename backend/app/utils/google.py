import httpx
from fastapi import HTTPException, status
from app.core.config import settings


async def verify_google(access_token: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                settings.GOOGLE_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )

        if res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Google OAuth access token."
            )

        return res.json()
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Google OAuth provider unreachable: {str(e)}"
        )