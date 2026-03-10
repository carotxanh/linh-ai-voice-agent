import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
AGENT_ID = os.getenv("AGENT_ID")

app = FastAPI(title="LINH AI Backend", version="1.0.0")

# CORS — cho phép frontend Vite dev server (port 5173) gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://linhvoice.io.vn", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "LINH AI Backend"}


@app.get("/api/signed-url")
async def get_signed_url():
    """
    Lấy signed WebSocket URL từ ElevenLabs API.
    Frontend sẽ dùng URL này để kết nối trực tiếp tới ElevenLabs agent
    mà không cần expose API key.
    """
    if not ELEVENLABS_API_KEY or not AGENT_ID:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY hoặc AGENT_ID chưa được cấu hình trong .env",
        )

    url = f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={AGENT_ID}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                url,
                headers={"xi-api-key": ELEVENLABS_API_KEY},
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Không thể kết nối tới ElevenLabs API: {str(e)}",
            )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"ElevenLabs API lỗi: {response.text}",
        )

    data = response.json()
    return {"signed_url": data.get("signed_url")}
