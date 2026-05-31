import httpx
from fastapi import HTTPException

GOOGLE_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

async def verify_google(access_token: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            GOOGLE_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )

    if res.status_code != 200:
        raise HTTPException(401, "Invalid Google token")

    return res.json()