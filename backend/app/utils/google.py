import httpx
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

async def verify_google(access_token: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            os.getenv("GOOGLE_URL"),
            headers={"Authorization": f"Bearer {access_token}"}
        )

    if res.status_code != 200:
        raise HTTPException(401, "Invalid Google token")

    return res.json()