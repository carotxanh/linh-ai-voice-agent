import os
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
import bcrypt
import jwt
from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
AGENT_ID = os.getenv("AGENT_ID")
DEFAULT_VOICE_API_BASE_URL = os.getenv("VOICE_API_BASE_URL")
if DEFAULT_VOICE_API_BASE_URL:
    DEFAULT_VOICE_API_BASE_URL = DEFAULT_VOICE_API_BASE_URL.rstrip("/")
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
DATA_ENCRYPTION_KEY = os.getenv("DATA_ENCRYPTION_KEY")
try:
    fernet = Fernet(DATA_ENCRYPTION_KEY.encode("utf-8")) if DATA_ENCRYPTION_KEY else None
except ValueError:
    fernet = None

app = FastAPI(title="LINH AI Backend", version="1.0.0")
security = HTTPBearer()
Base = declarative_base()
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="owner")
    hashed_password = Column(String(255), nullable=False)
    voice_api_key_encrypted = Column(String, nullable=True)
    voice_api_base_url = Column(String(255), nullable=False, default=DEFAULT_VOICE_API_BASE_URL)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AccountIntegrationRequest(BaseModel):
    api_key: str | None = None
    api_base_url: str | None = None


class AccountIntegrationResponse(BaseModel):
    has_api_key: bool
    api_base_url: str


def ensure_user_columns():
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS voice_api_key_encrypted TEXT"))
        connection.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS "
                "voice_api_base_url VARCHAR(255) DEFAULT 'https://api.vapi.ai' NOT NULL"
            )
        )


@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)
    ensure_user_columns()

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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def encrypt_secret(value: str) -> str:
    if not fernet:
        raise HTTPException(
            status_code=500,
            detail="May chu chua co DATA_ENCRYPTION_KEY hop le de bao ve khoa ket noi",
        )
    return fernet.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str) -> str:
    if not fernet:
        raise HTTPException(
            status_code=500,
            detail="May chu chua co DATA_ENCRYPTION_KEY hop le de doc khoa ket noi",
        )
    try:
        return fernet.decrypt(value.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        raise HTTPException(status_code=500, detail="Khoa ket noi da luu khong doc duoc")


def serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }


def create_access_token(user: User) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": expires_at,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (jwt.PyJWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token khong hop le")

    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Tai khoan khong ton tai hoac da bi khoa")

    return user


@app.post("/api/auth/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    full_name = payload.full_name.strip()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email khong hop le")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Mat khau phai co it nhat 8 ky tu")
    if not full_name:
        raise HTTPException(status_code=400, detail="Vui long nhap ten nguoi dung")

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email nay da duoc dang ky")

    user = User(
        email=email,
        full_name=full_name,
        role="owner",
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": create_access_token(user),
        "user": serialize_user(user),
    }


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoac mat khau khong dung")

    return {
        "access_token": create_access_token(user),
        "user": serialize_user(user),
    }


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@app.get("/api/account/integration", response_model=AccountIntegrationResponse)
async def get_account_integration(current_user: User = Depends(get_current_user)):
    return {
        "has_api_key": bool(current_user.voice_api_key_encrypted),
        "api_base_url": current_user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL,
    }


@app.patch("/api/account/integration", response_model=AccountIntegrationResponse)
async def update_account_integration(
    payload: AccountIntegrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    api_base_url = (payload.api_base_url or current_user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL).strip()
    if not api_base_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Dia chi ket noi khong hop le")

    current_user.voice_api_base_url = api_base_url.rstrip("/")
    if payload.api_key is not None:
        api_key = payload.api_key.strip()
        if len(api_key) < 12:
            raise HTTPException(status_code=400, detail="Khoa ket noi qua ngan")
        current_user.voice_api_key_encrypted = encrypt_secret(api_key)

    current_user.updated_at = datetime.now(timezone.utc)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "has_api_key": bool(current_user.voice_api_key_encrypted),
        "api_base_url": current_user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL,
    }


def get_voice_api_config(user: User) -> tuple[str, str]:
    if not user.voice_api_key_encrypted:
        raise HTTPException(
            status_code=400,
            detail="Tai khoan chua cau hinh khoa ket noi LinhVoice",
        )
    return decrypt_secret(user.voice_api_key_encrypted), (user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL).rstrip("/")


async def voice_api_get(user: User, path: str, params: dict[str, Any] | None = None) -> Any:
    token, base_url = get_voice_api_config(user)
    url = f"{base_url}{path}"

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.get(
                url,
                params={key: value for key, value in (params or {}).items() if value is not None},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Khong the ket noi toi dich vu thoai: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Dich vu thoai bao loi: {response.text}",
        )

    return response.json()


async def voice_api_patch(user: User, path: str, payload: dict[str, Any]) -> Any:
    token, base_url = get_voice_api_config(user)
    url = f"{base_url}{path}"

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.patch(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Khong the ket noi toi dich vu thoai: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Dich vu thoai bao loi: {response.text}",
        )

    return response.json()


async def voice_api_upload_file(user: User, file: UploadFile) -> Any:
    token, base_url = get_voice_api_config(user)
    content = await file.read()

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{base_url}/file",
                files={
                    "file": (
                        file.filename,
                        content,
                        file.content_type or "application/octet-stream",
                    )
                },
                headers={"Authorization": f"Bearer {token}"},
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Khong the tai tai lieu len dich vu thoai: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Dich vu thoai bao loi: {response.text}",
        )

    return response.json()


def get_nested(data: dict[str, Any], *keys: str, default: Any = None) -> Any:
    current: Any = data
    for key in keys:
        if not isinstance(current, dict):
            return default
        current = current.get(key)
    return default if current is None else current


def format_duration(seconds: Any) -> str:
    try:
        total_seconds = max(0, int(float(seconds)))
    except (TypeError, ValueError):
        return "0:00"

    minutes, remaining_seconds = divmod(total_seconds, 60)
    return f"{minutes}:{remaining_seconds:02d}"


def format_iso_datetime(value: Any) -> str:
    if not value:
        return ""

    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return str(value)

    return parsed.isoformat()


def format_cost(value: Any) -> float:
    try:
        return round(float(value or 0), 4)
    except (TypeError, ValueError):
        return 0


def infer_call_status(call: dict[str, Any]) -> str:
    status = str(call.get("status") or "").lower()
    ended_reason = str(call.get("endedReason") or "").lower()

    if status in {"queued", "ringing", "in-progress", "in_progress", "active"}:
        return "active"
    if status in {"ended", "completed", "complete"}:
        return "completed"
    if any(value in ended_reason for value in ("no-answer", "busy", "voicemail", "missed")):
        return "missed"
    if any(value in ended_reason for value in ("transfer", "forward")):
        return "transferred"
    if status:
        return status
    return "unknown"


def normalize_call(call: dict[str, Any]) -> dict[str, Any]:
    started_at = call.get("startedAt") or call.get("createdAt")
    ended_at = call.get("endedAt")
    duration_seconds = call.get("durationSeconds")

    if duration_seconds is None and started_at and ended_at:
        try:
            started = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            ended = datetime.fromisoformat(ended_at.replace("Z", "+00:00"))
            duration_seconds = (ended - started).total_seconds()
        except (TypeError, ValueError):
            duration_seconds = 0

    customer_number = get_nested(call, "customer", "number")
    assistant = call.get("assistant") or {}
    phone_number = (
        customer_number
        or get_nested(call, "phoneNumber", "number")
        or call.get("phoneNumber")
        or call.get("phoneNumberId")
        or "Unknown"
    )
    assistant_name = get_nested(call, "assistant", "name") or call.get("assistantName") or "Unknown assistant"
    transcript = get_nested(call, "artifact", "transcript") or call.get("transcript") or ""
    summary = get_nested(call, "analysis", "summary") or call.get("summary") or "Chua co tom tat."
    recording_url = (
        get_nested(call, "artifact", "recording", "stereoUrl")
        or get_nested(call, "artifact", "recording", "mono", "combinedUrl")
        or get_nested(call, "artifact", "recordingUrl")
        or call.get("recordingUrl")
    )

    return {
        "id": call.get("id"),
        "orgId": call.get("orgId"),
        "phoneNumber": phone_number,
        "phoneNumberId": call.get("phoneNumberId"),
        "customerName": get_nested(call, "customer", "name") or phone_number,
        "customerNumber": customer_number or phone_number,
        "assistantId": call.get("assistantId") or assistant.get("id"),
        "assistantName": assistant_name,
        "duration": format_duration(duration_seconds),
        "durationSeconds": duration_seconds or 0,
        "createdAt": format_iso_datetime(call.get("createdAt")),
        "startedAt": format_iso_datetime(started_at),
        "endedAt": format_iso_datetime(ended_at),
        "timestamp": format_iso_datetime(started_at or call.get("createdAt")),
        "status": infer_call_status(call),
        "rawStatus": call.get("status"),
        "endedReason": call.get("endedReason"),
        "type": call.get("type") or "unknown",
        "messageCount": len(get_nested(call, "artifact", "messages", default=[]) or []),
        "summary": summary,
        "transcript": transcript,
        "recordingUrl": recording_url,
        "cost": format_cost(call.get("cost")),
        "costBreakdown": get_nested(call, "costBreakdown", default={}) or {},
        "analysis": call.get("analysis") or {},
        "artifact": call.get("artifact") or {},
        "raw": call,
    }


def normalize_assistant(assistant: dict[str, Any]) -> dict[str, Any]:
    model = assistant.get("model") or {}
    voice = assistant.get("voice") or {}
    transcriber = assistant.get("transcriber") or {}

    return {
        "id": assistant.get("id"),
        "name": assistant.get("name") or "Unnamed assistant",
        "createdAt": format_iso_datetime(assistant.get("createdAt")),
        "updatedAt": format_iso_datetime(assistant.get("updatedAt")),
        "modelProvider": model.get("provider") or "",
        "modelName": model.get("model") or "",
        "voiceProvider": voice.get("provider") or "",
        "voiceId": voice.get("voiceId") or voice.get("id") or "",
        "transcriberProvider": transcriber.get("provider") or "",
        "transcriberLanguage": transcriber.get("language") or "",
        "firstMessage": assistant.get("firstMessage") or "",
        "endCallMessage": assistant.get("endCallMessage") or "",
        "raw": assistant,
    }


def normalize_phone_number(phone_number: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": phone_number.get("id"),
        "number": phone_number.get("number") or phone_number.get("phoneNumber") or "",
        "name": phone_number.get("name") or phone_number.get("provider") or "Phone number",
        "provider": phone_number.get("provider") or "",
        "assistantId": phone_number.get("assistantId") or get_nested(phone_number, "assistant", "id"),
        "assistantName": get_nested(phone_number, "assistant", "name") or "",
        "createdAt": format_iso_datetime(phone_number.get("createdAt")),
        "updatedAt": format_iso_datetime(phone_number.get("updatedAt")),
        "raw": phone_number,
    }


def normalize_file(file: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": file.get("id"),
        "name": file.get("name") or file.get("originalName") or "Tai lieu",
        "originalName": file.get("originalName") or "",
        "status": file.get("status") or "",
        "purpose": file.get("purpose") or "",
        "mimetype": file.get("mimetype") or "",
        "bytes": file.get("bytes") or 0,
        "parsedTextBytes": file.get("parsedTextBytes") or 0,
        "url": file.get("url") or "",
        "parsedTextUrl": file.get("parsedTextUrl") or "",
        "createdAt": format_iso_datetime(file.get("createdAt")),
        "updatedAt": format_iso_datetime(file.get("updatedAt")),
        "metadata": file.get("metadata") or {},
        "raw": file,
    }


@app.get("/api/voice/assistants")
async def list_voice_assistants(
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    assistants = await voice_api_get(current_user, "/assistant", {"limit": limit})
    return [normalize_assistant(assistant) for assistant in assistants]


@app.get("/api/voice/calls")
async def list_voice_calls(
    limit: int = Query(50, ge=1, le=1000),
    assistant_id: str | None = Query(default=None, alias="assistantId"),
    created_at_ge: str | None = Query(default=None, alias="createdAtGe"),
    created_at_le: str | None = Query(default=None, alias="createdAtLe"),
    current_user: User = Depends(get_current_user),
):
    calls = await voice_api_get(
        current_user,
        "/call",
        {
            "limit": limit,
            "assistantId": assistant_id,
            "createdAtGe": created_at_ge,
            "createdAtLe": created_at_le,
        },
    )
    return [normalize_call(call) for call in calls]


@app.get("/api/voice/calls/{call_id}")
async def get_voice_call(call_id: str, current_user: User = Depends(get_current_user)):
    call = await voice_api_get(current_user, f"/call/{call_id}")
    return normalize_call(call)


@app.get("/api/voice/phone-numbers")
async def list_voice_phone_numbers(
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    phone_numbers = await voice_api_get(current_user, "/phone-number", {"limit": limit})
    return [normalize_phone_number(phone_number) for phone_number in phone_numbers]


@app.get("/api/voice/files")
async def list_voice_files(current_user: User = Depends(get_current_user)):
    files = await voice_api_get(current_user, "/file")
    return [normalize_file(file) for file in files]


@app.post("/api/voice/files")
async def upload_voice_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    uploaded_file = await voice_api_upload_file(current_user, file)
    return normalize_file(uploaded_file)


@app.patch("/api/voice/assistants/{assistant_id}")
async def update_voice_assistant(
    assistant_id: str,
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    allowed_fields = {
        "name",
        "firstMessage",
        "endCallMessage",
        "model",
        "voice",
        "transcriber",
        "metadata",
    }
    safe_payload = {key: value for key, value in payload.items() if key in allowed_fields}

    if not safe_payload:
        raise HTTPException(status_code=400, detail="Khong co truong hop le de cap nhat assistant")

    assistant = await voice_api_patch(current_user, f"/assistant/{assistant_id}", safe_payload)
    return normalize_assistant(assistant)


@app.patch("/api/voice/phone-numbers/{phone_number_id}")
async def update_voice_phone_number(
    phone_number_id: str,
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    allowed_fields = {"assistantId", "name", "server"}
    safe_payload = {key: value for key, value in payload.items() if key in allowed_fields}

    if not safe_payload:
        raise HTTPException(status_code=400, detail="Khong co truong hop le de cap nhat phone number")

    phone_number = await voice_api_patch(current_user, f"/phone-number/{phone_number_id}", safe_payload)
    return normalize_phone_number(phone_number)


@app.get("/api/voice/dashboard")
async def get_voice_dashboard(
    limit: int = Query(50, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    calls = [normalize_call(call) for call in await voice_api_get(current_user, "/call", {"limit": limit})]
    assistants = [normalize_assistant(assistant) for assistant in await voice_api_get(current_user, "/assistant", {"limit": 100})]
    phone_numbers = [
        normalize_phone_number(phone_number)
        for phone_number in await voice_api_get(current_user, "/phone-number", {"limit": 100})
    ]
    files = [normalize_file(file) for file in await voice_api_get(current_user, "/file")]

    completed = sum(1 for call in calls if call["status"] == "completed")
    active = sum(1 for call in calls if call["status"] == "active")
    missed = sum(1 for call in calls if call["status"] == "missed")
    transferred = sum(1 for call in calls if call["status"] == "transferred")
    total_cost = sum(float(call.get("cost") or 0) for call in calls)
    average_duration = (
        sum(float(call.get("durationSeconds") or 0) for call in calls) / len(calls)
        if calls
        else 0
    )

    return {
        "stats": {
            "totalCalls": len(calls),
            "completedCalls": completed,
            "activeCalls": active,
            "missedCalls": missed,
            "transferredCalls": transferred,
            "averageDuration": format_duration(average_duration),
            "successRate": round((completed / len(calls)) * 100, 1) if calls else 0,
            "totalCost": round(total_cost, 4),
            "assistantCount": len(assistants),
            "phoneNumberCount": len(phone_numbers),
            "fileCount": len(files),
            "processedFileCount": sum(1 for file in files if file.get("status") == "done"),
        },
        "recentCalls": calls[:5],
        "assistants": assistants,
        "phoneNumbers": phone_numbers,
        "files": files,
    }


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
