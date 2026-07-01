import os
import re
import smtplib
import ssl
import logging
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from time import perf_counter
from typing import Any
from urllib.parse import urlparse

import httpx
import bcrypt
import jwt
from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine, text
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

logger = logging.getLogger("linh-ai-backend")

API_PREFIX = os.getenv("API_PREFIX", "/api").strip()
API_PREFIX = f"/{API_PREFIX.strip('/')}" if API_PREFIX.strip("/") else ""
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
DEFAULT_VOICE_API_BASE_URL = os.getenv("VOICE_API_BASE_URL", "https://api.retellai.com")
if DEFAULT_VOICE_API_BASE_URL:
    DEFAULT_VOICE_API_BASE_URL = DEFAULT_VOICE_API_BASE_URL.rstrip("/")
RETELL_KNOWLEDGE_BASE_ID = os.getenv("RETELL_KNOWLEDGE_BASE_ID")
DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_CONNECT_TIMEOUT = int(os.getenv("DATABASE_CONNECT_TIMEOUT", "5"))
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
DATA_ENCRYPTION_KEY = os.getenv("DATA_ENCRYPTION_KEY")
CONTACT_EMAIL_RECIPIENT = os.getenv("CONTACT_EMAIL_RECIPIENT", "linhvoice29@gmail.com")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL") or SMTP_USERNAME
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() == "true"
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
try:
    fernet = Fernet(DATA_ENCRYPTION_KEY.encode("utf-8")) if DATA_ENCRYPTION_KEY else None
except ValueError:
    fernet = None

app = FastAPI(title="LINH AI Backend", version="1.0.0")
security = HTTPBearer()
Base = declarative_base()
database_host = urlparse(DATABASE_URL.replace("+psycopg2", "")).hostname if DATABASE_URL else None
engine_options = {"pool_pre_ping": True}
if database_host and database_host.endswith(".supabase.com"):
    engine_options["connect_args"] = {
        "sslmode": "require",
        "connect_timeout": DATABASE_CONNECT_TIMEOUT,
    }
engine = create_engine(DATABASE_URL, **engine_options)
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


class ContactLead(Base):
    __tablename__ = "contact_leads"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    company_name = Column(String(255), nullable=False)
    business_need = Column(String(500), nullable=False)
    preferred_contact_time = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    email_sent = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


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
    api_key_status: str = "missing"
    message: str | None = None


class ContactLeadRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    company_name: str
    business_need: str
    preferred_contact_time: str
    message: str


class ContactLeadResponse(BaseModel):
    message: str
    lead_id: int
    email_sent: bool


def ensure_user_columns():
    voice_api_default = (DEFAULT_VOICE_API_BASE_URL or "").replace("'", "''")

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS voice_api_key_encrypted TEXT"))
        connection.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS "
                f"voice_api_base_url VARCHAR(255) DEFAULT '{voice_api_default}' NOT NULL"
            )
        )
        connection.execute(
            text(f"ALTER TABLE users ALTER COLUMN voice_api_base_url SET DEFAULT '{voice_api_default}'")
        )


@app.on_event("startup")
def create_database_tables():
    try:
        Base.metadata.create_all(bind=engine)
        ensure_user_columns()
    except OperationalError as e:
        logger.error("Database startup check failed: %s", e)
    except SQLAlchemyError as e:
        logger.error("Database startup check failed: %s", e)


@app.exception_handler(OperationalError)
async def database_operational_error_handler(_request, _exc):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Khong the ket noi Supabase/Postgres. Kiem tra DATABASE_URL, pooler port va mang/firewall.",
        },
    )

# CORS â€” cho phÃ©p frontend Vite dev server (port 5173) gá»i API
if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get(f"{API_PREFIX}/health")
async def health_check():
    return {"status": "ok", "service": "LINH AI Backend"}


@app.get(f"{API_PREFIX}/health/database")
def database_health_check():
    started_at = perf_counter()

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar_one()
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database connection failed")

    return {
        "status": "ok",
        "database": "connected",
        "query": result == 1,
        "latency_ms": round((perf_counter() - started_at) * 1000, 2),
    }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post(f"{API_PREFIX}/contact-leads", response_model=ContactLeadResponse)
async def create_contact_lead(payload: ContactLeadRequest, db: Session = Depends(get_db)):
    lead = ContactLead(
        full_name=clean_required_text(payload.full_name, "Ho ten"),
        email=validate_public_email(payload.email),
        phone=validate_phone(payload.phone),
        company_name=clean_required_text(payload.company_name, "Ten doanh nghiep"),
        business_need=clean_required_text(payload.business_need, "Muc tieu trien khai", min_length=5, max_length=500),
        preferred_contact_time=clean_required_text(payload.preferred_contact_time, "Nganh nghe", max_length=255),
        message=clean_required_text(payload.message, "Nhu cau chinh", min_length=10, max_length=3000),
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    email_sent = send_contact_email(lead)
    if email_sent:
        lead.email_sent = True
        db.add(lead)
        db.commit()

    return {
        "message": "Da nhan thong tin tu van",
        "lead_id": lead.id,
        "email_sent": email_sent,
    }


def normalize_email(email: str) -> str:
    return email.strip().lower()


def clean_required_text(value: str, field_name: str, min_length: int = 2, max_length: int = 255) -> str:
    cleaned = " ".join((value or "").split())
    if len(cleaned) < min_length:
        raise HTTPException(status_code=400, detail=f"{field_name} khong hop le")
    if len(cleaned) > max_length:
        raise HTTPException(status_code=400, detail=f"{field_name} qua dai")
    return cleaned


def validate_public_email(email: str) -> str:
    cleaned = normalize_email(email)
    if len(cleaned) > 255 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", cleaned):
        raise HTTPException(status_code=400, detail="Email khong hop le")
    return cleaned


def validate_phone(phone: str) -> str:
    cleaned = re.sub(r"\s+", "", phone or "")
    if not re.fullmatch(r"\+?[0-9().-]{8,20}", cleaned):
        raise HTTPException(status_code=400, detail="So dien thoai khong hop le")
    return cleaned


def send_contact_email(lead: ContactLead) -> bool:
    if not (SMTP_HOST and SMTP_FROM_EMAIL and CONTACT_EMAIL_RECIPIENT):
        logger.warning(
            "Contact lead %s was saved but email was not sent because SMTP is not fully configured",
            lead.id,
        )
        return False

    email = EmailMessage()
    email["Subject"] = f"Lead tu van moi tu {lead.full_name}"
    email["From"] = SMTP_FROM_EMAIL
    email["To"] = CONTACT_EMAIL_RECIPIENT
    email["Reply-To"] = lead.email
    email.set_content(
        "\n".join(
            [
                "Co khach hang de lai thong tin tu landing page LinhVoice.",
                "",
                f"Ho ten: {lead.full_name}",
                f"Email: {lead.email}",
                f"So dien thoai: {lead.phone}",
                f"Doanh nghiep: {lead.company_name}",
                f"Muc tieu trien khai: {lead.business_need}",
                f"Nganh nghe: {lead.preferred_contact_time}",
                "",
                "Nhu cau chinh:",
                lead.message,
                "",
                f"Lead ID: {lead.id}",
                f"Thoi gian tao: {lead.created_at.isoformat()}",
            ]
        )
    )

    try:
        if SMTP_USE_SSL:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if SMTP_USERNAME and SMTP_PASSWORD:
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(email)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if SMTP_USE_TLS:
                    server.starttls(context=ssl.create_default_context())
                if SMTP_USERNAME and SMTP_PASSWORD:
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(email)
    except smtplib.SMTPAuthenticationError:
        logger.warning(
            "Contact lead %s was saved but Gmail SMTP authentication failed for %s",
            lead.id,
            SMTP_USERNAME,
        )
        return False
    except smtplib.SMTPException as e:
        logger.warning("Contact lead %s was saved but SMTP send failed: %s", lead.id, e)
        return False
    except OSError as e:
        logger.warning("Contact lead %s was saved but SMTP connection failed: %s", lead.id, e)
        return False

    logger.info("Contact lead %s email notification sent to %s", lead.id, CONTACT_EMAIL_RECIPIENT)
    return True


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
        raise HTTPException(status_code=400, detail="Khoa ket noi da luu khong doc duoc. Vui long nhap lai khoa ket noi")


def stored_secret_status(value: str | None) -> tuple[bool, str, str | None]:
    if not value:
        return False, "missing", None
    if not fernet:
        return False, "unreadable", "May chu chua co DATA_ENCRYPTION_KEY hop le de doc khoa ket noi"
    try:
        fernet.decrypt(value.encode("utf-8"))
    except InvalidToken:
        return False, "unreadable", "Khoa ket noi da luu khong doc duoc. Vui long nhap lai khoa ket noi"
    return True, "valid", None


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


@app.post(f"{API_PREFIX}/auth/register", response_model=AuthResponse)
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


@app.post(f"{API_PREFIX}/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoac mat khau khong dung")

    return {
        "access_token": create_access_token(user),
        "user": serialize_user(user),
    }


@app.get(f"{API_PREFIX}/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@app.get(f"{API_PREFIX}/account/integration", response_model=AccountIntegrationResponse)
async def get_account_integration(current_user: User = Depends(get_current_user)):
    has_api_key, api_key_status, message = stored_secret_status(current_user.voice_api_key_encrypted)
    return {
        "has_api_key": has_api_key,
        "api_base_url": current_user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL or "",
        "api_key_status": api_key_status,
        "message": message,
    }


@app.patch(f"{API_PREFIX}/account/integration", response_model=AccountIntegrationResponse)
async def update_account_integration(
    payload: AccountIntegrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    api_base_url = (payload.api_base_url or current_user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL or "").strip()
    if not api_base_url:
        raise HTTPException(status_code=400, detail="Vui long cau hinh dia chi API thoai")
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

    has_api_key, api_key_status, message = stored_secret_status(current_user.voice_api_key_encrypted)
    return {
        "has_api_key": has_api_key,
        "api_base_url": current_user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL or "",
        "api_key_status": api_key_status,
        "message": message,
    }


def get_voice_api_config(user: User) -> tuple[str, str]:
    if not user.voice_api_key_encrypted:
        raise HTTPException(
            status_code=400,
            detail="Tai khoan chua cau hinh khoa ket noi LinhVoice",
        )

    base_url = user.voice_api_base_url or DEFAULT_VOICE_API_BASE_URL
    if not base_url:
        raise HTTPException(status_code=500, detail="VOICE_API_BASE_URL chua duoc cau hinh")

    return decrypt_secret(user.voice_api_key_encrypted), normalize_voice_api_base_url(base_url)


def normalize_voice_api_base_url(base_url: str) -> str:
    normalized = base_url.rstrip("/")
    for version_suffix in ("/v1", "/v2", "/v3"):
        if normalized.endswith(version_suffix):
            return normalized[: -len(version_suffix)]
    return normalized


async def retell_api_request(
    user: User,
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    payload: dict[str, Any] | None = None,
    files: dict[str, Any] | list[tuple[str, Any]] | None = None,
    timeout: float = 20.0,
) -> Any:
    token, base_url = get_voice_api_config(user)
    url = f"{base_url}{path}"
    headers = {"Authorization": f"Bearer {token}"}
    if files is None:
        headers["Content-Type"] = "application/json"
    clean_payload = (
        {key: value for key, value in (payload or {}).items() if value is not None}
        if payload is not None
        else None
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.request(
                method,
                url,
                params={key: value for key, value in (params or {}).items() if value is not None},
                json=clean_payload if files is None else None,
                files=files,
                headers=headers,
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Khong the ket noi toi Retell AI: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Retell AI bao loi: {response.text}",
        )

    if not response.content:
        return None
    return response.json()


async def voice_api_upload_file(user: User, file: UploadFile) -> Any:
    content = await file.read()
    knowledge_base_id = RETELL_KNOWLEDGE_BASE_ID
    if not knowledge_base_id:
        knowledge_bases = await retell_api_request(user, "GET", "/list-knowledge-bases")
        if not knowledge_bases:
            raise HTTPException(
                status_code=400,
                detail="Chua co knowledge base tren Retell. Hay tao knowledge base hoac cau hinh RETELL_KNOWLEDGE_BASE_ID",
            )
        knowledge_base_id = knowledge_bases[0].get("knowledge_base_id")

    knowledge_base = await retell_api_request(
        user,
        "POST",
        f"/add-knowledge-base-sources/{knowledge_base_id}",
        files=[
            (
                "knowledge_base_files",
                (
                    file.filename,
                    content,
                    file.content_type or "application/octet-stream",
                ),
            )
        ],
        timeout=60.0,
    )

    sources = normalize_knowledge_base_sources(knowledge_base)
    for source in sources:
        if source.get("originalName") == file.filename or source.get("name") == file.filename:
            return source

    return normalize_knowledge_base(knowledge_base)


async def retell_api_list_all(
    user: User,
    method: str,
    path: str,
    limit: int = 100,
    params: dict[str, Any] | None = None,
    payload: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    request_params = {**(params or {}), "limit": limit}
    request_payload = {**(payload or {}), "limit": limit}
    items: list[dict[str, Any]] = []
    pagination_key = None

    while True:
        if method.upper() == "GET":
            page = await retell_api_request(
                user,
                method,
                path,
                params={**request_params, "pagination_key": pagination_key},
            )
        else:
            page = await retell_api_request(
                user,
                method,
                path,
                payload={**request_payload, "pagination_key": pagination_key},
            )

        if isinstance(page, list):
            return page

        page_items = page.get("items", []) if isinstance(page, dict) else []
        items.extend(page_items)
        pagination_key = page.get("pagination_key") if isinstance(page, dict) else None

        if not isinstance(page, dict) or not page.get("has_more") or not pagination_key or len(items) >= limit:
            return items[:limit]


async def retell_list_calls(
    user: User,
    limit: int = 50,
    filter_criteria: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    payload = {"filter_criteria": filter_criteria or {}}

    try:
        return await retell_api_list_all(
            user,
            "POST",
            "/v3/list-calls",
            limit=limit,
            payload=payload,
        )
    except HTTPException as e:
        if e.status_code != 404:
            raise

    legacy_calls = await retell_api_request(
        user,
        "POST",
        "/v2/list-calls",
        payload={"limit": limit, **payload},
    )
    if not isinstance(legacy_calls, list):
        return []

    return legacy_calls[:limit]


def retell_timestamp_to_iso(value: Any) -> str:
    if value is None or value == "":
        return ""
    try:
        timestamp = float(value)
        if timestamp > 1_000_000_000_000:
            timestamp = timestamp / 1000
        return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
    except (TypeError, ValueError, OSError):
        return format_iso_datetime(value)


def iso_datetime_to_retell_timestamp(value: str) -> int | None:
    if not value:
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        pass

    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None

    return int(parsed.timestamp() * 1000)


def pick_retell_agent_binding(bindings: Any) -> dict[str, Any]:
    if isinstance(bindings, list) and bindings:
        return bindings[0] if isinstance(bindings[0], dict) else {}
    return {}


def normalize_retell_status(status: Any, disconnection_reason: Any = None) -> str:
    normalized = str(status or "").lower()
    reason = str(disconnection_reason or "").lower()

    if normalized in {"registered", "ongoing", "ringing", "in_progress", "in-progress"}:
        return "active"
    if normalized in {"ended", "completed", "complete"}:
        return "completed"
    if any(value in reason for value in ("voicemail", "dial_no_answer", "busy", "not_connected")):
        return "missed"
    if "transfer" in reason:
        return "transferred"
    return normalized or "unknown"


def normalize_knowledge_base_sources(knowledge_base: dict[str, Any]) -> list[dict[str, Any]]:
    normalized_sources = []
    knowledge_base_id = knowledge_base.get("knowledge_base_id")
    knowledge_base_name = knowledge_base.get("knowledge_base_name") or "Knowledge base"
    status = knowledge_base.get("status")
    updated_at = retell_timestamp_to_iso(knowledge_base.get("last_refreshed_timestamp"))

    for source in knowledge_base.get("knowledge_base_sources") or []:
        normalized_sources.append(
            {
                "id": source.get("source_id") or f"{knowledge_base_id}:{source.get('filename') or source.get('type')}",
                "name": source.get("filename") or source.get("url") or source.get("type") or knowledge_base_name,
                "originalName": source.get("filename") or "",
                "status": "done" if status == "complete" else status or "",
                "purpose": "knowledge_base",
                "mimetype": source.get("type") or "",
                "bytes": source.get("file_size") or 0,
                "parsedTextBytes": 0,
                "url": source.get("file_url") or source.get("url") or "",
                "parsedTextUrl": "",
                "createdAt": updated_at,
                "updatedAt": updated_at,
                "metadata": {"knowledgeBaseId": knowledge_base_id, "knowledgeBaseName": knowledge_base_name},
                "raw": source,
            }
        )

    return normalized_sources


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


def format_retell_cost(value: Any) -> float:
    try:
        return round(float(value or 0) / 10, 4)
    except (TypeError, ValueError):
        return 0


def format_retell_product_name(value: Any) -> str:
    product = str(value or "").replace("_", " ").strip()
    return product.title() if product else "Unknown"


def normalize_transcript_turns(call: dict[str, Any]) -> list[dict[str, Any]]:
    transcript_object = (
        call.get("transcript_object")
        or call.get("scrubbed_transcript_with_tool_calls")
        or call.get("transcript_with_tool_calls")
        or get_nested(call, "artifact", "messages", default=[])
        or []
    )
    turns: list[dict[str, Any]] = []

    if isinstance(transcript_object, list):
        for index, message in enumerate(transcript_object):
            if not isinstance(message, dict):
                continue
            role = str(message.get("role") or message.get("speaker") or "").lower()
            content = (message.get("content") or message.get("text") or "").strip()
            if not content:
                continue
            speaker_type = "customer" if role in {"user", "customer", "caller"} else "agent"
            turns.append(
                {
                    "id": f"turn-{index}",
                    "speaker": "Khách hàng" if speaker_type == "customer" else "LinhVoice",
                    "speakerType": speaker_type,
                    "text": content,
                    "start": (message.get("words") or [{}])[0].get("start") if message.get("words") else None,
                    "end": (message.get("words") or [{}])[-1].get("end") if message.get("words") else None,
                }
            )

    if turns:
        return turns

    transcript = call.get("transcript") or ""
    for index, line in enumerate(transcript.splitlines()):
        match = re.match(r"^(User|Customer|Caller|Agent|Assistant|AI|LINH):\s*(.*)$", line.strip(), re.I)
        if not match or not match.group(2).strip():
            continue
        is_customer = re.search(r"user|customer|caller", match.group(1), re.I) is not None
        turns.append(
                {
                    "id": f"turn-{index}",
                    "speaker": "Khách hàng" if is_customer else "LinhVoice",
                    "speakerType": "customer" if is_customer else "agent",
                    "text": match.group(2).strip(),
                    "start": None,
                    "end": None,
                }
        )

    return turns


def normalize_call_cost_products(call: dict[str, Any]) -> list[dict[str, Any]]:
    products = get_nested(call, "call_cost", "product_costs", default=[]) or []
    normalized_products = []
    if not isinstance(products, list):
        return normalized_products

    for product in products:
        if not isinstance(product, dict):
            continue
        normalized_products.append(
            {
                "name": format_retell_product_name(product.get("product")),
                "cost": format_retell_cost(product.get("cost")),
                "unitPrice": format_retell_cost(product.get("unit_price")),
            }
        )
    return normalized_products


def normalize_sentiment(value: Any) -> dict[str, str]:
    sentiment = str(value or "").lower()
    if sentiment == "positive":
        return {"value": "positive", "label": "Tích cực"}
    if sentiment == "negative":
        return {"value": "negative", "label": "Tiêu cực"}
    if sentiment == "neutral":
        return {"value": "neutral", "label": "Trung tính"}
    return {"value": "unknown", "label": "Chưa rõ"}


def should_review_call(call: dict[str, Any]) -> bool:
    analysis = call.get("call_analysis") or call.get("analysis") or {}
    status = normalize_retell_status(call.get("call_status") or call.get("status"), call.get("disconnection_reason"))
    disconnection_reason = str(call.get("disconnection_reason") or call.get("endedReason") or "").lower()
    sentiment = str(analysis.get("user_sentiment") or "").lower()
    return (
        analysis.get("call_successful") is False
        or status in {"missed", "unknown"}
        or sentiment == "negative"
        or any(reason in disconnection_reason for reason in ("error", "timeout", "dial_no_answer", "busy"))
    )


def average_latency_ms(call: dict[str, Any]) -> float:
    latency = call.get("latency") or {}
    if not isinstance(latency, dict):
        return 0

    values = []
    for metric_name in ("e2e", "llm", "asr", "tts"):
        metric = latency.get(metric_name) or {}
        if isinstance(metric, dict) and metric.get("p50") is not None:
            try:
                values.append(float(metric.get("p50")))
            except (TypeError, ValueError):
                pass

    return round(sum(values) / len(values), 1) if values else 0


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
    started_at = call.get("startedAt") or call.get("createdAt") or retell_timestamp_to_iso(call.get("start_timestamp"))
    ended_at = call.get("endedAt") or retell_timestamp_to_iso(call.get("end_timestamp"))
    duration_seconds = call.get("durationSeconds")
    if duration_seconds is None and call.get("duration_ms") is not None:
        try:
            duration_seconds = float(call.get("duration_ms")) / 1000
        except (TypeError, ValueError):
            duration_seconds = 0

    if duration_seconds is None and started_at and ended_at:
        try:
            started = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            ended = datetime.fromisoformat(ended_at.replace("Z", "+00:00"))
            duration_seconds = (ended - started).total_seconds()
        except (TypeError, ValueError):
            duration_seconds = 0

    customer_number = (
        get_nested(call, "customer", "number")
        or call.get("to_number")
        or call.get("from_number")
    )
    assistant = call.get("assistant") or {}
    phone_number = (
        customer_number
        or get_nested(call, "phoneNumber", "number")
        or call.get("phoneNumber")
        or call.get("phoneNumberId")
        or call.get("from_number")
        or call.get("to_number")
        or "Unknown"
    )
    assistant_name = (
        get_nested(call, "assistant", "name")
        or call.get("assistantName")
        or call.get("agent_name")
        or "Unknown assistant"
    )
    transcript = get_nested(call, "artifact", "transcript") or call.get("transcript") or ""
    summary = (
        get_nested(call, "analysis", "summary")
        or get_nested(call, "call_analysis", "call_summary")
        or call.get("summary")
        or "Chua co tom tat."
    )
    recording_url = (
        get_nested(call, "artifact", "recording", "stereoUrl")
        or get_nested(call, "artifact", "recording", "mono", "combinedUrl")
        or get_nested(call, "artifact", "recordingUrl")
        or call.get("recordingUrl")
        or call.get("recording_url")
        or call.get("recording_multi_channel_url")
    )
    analysis = call.get("analysis") or call.get("call_analysis") or {}
    sentiment = normalize_sentiment(analysis.get("user_sentiment"))
    transcript_turns = normalize_transcript_turns(call)
    successful = analysis.get("call_successful")
    retell_combined_cost = get_nested(call, "call_cost", "combined_cost")
    cost = (
        format_retell_cost(retell_combined_cost)
        if retell_combined_cost is not None
        else format_cost(call.get("cost"))
    )

    return {
        "id": call.get("id") or call.get("call_id"),
        "orgId": call.get("orgId"),
        "phoneNumber": phone_number,
        "phoneNumberId": call.get("phoneNumberId") or call.get("from_number"),
        "customerName": get_nested(call, "customer", "name") or phone_number,
        "customerNumber": customer_number or phone_number,
        "assistantId": call.get("assistantId") or assistant.get("id") or call.get("agent_id"),
        "assistantName": assistant_name,
        "duration": format_duration(duration_seconds),
        "durationSeconds": duration_seconds or 0,
        "createdAt": format_iso_datetime(call.get("createdAt")),
        "startedAt": format_iso_datetime(started_at),
        "endedAt": format_iso_datetime(ended_at),
        "timestamp": format_iso_datetime(started_at or call.get("createdAt")),
        "status": normalize_retell_status(call.get("call_status") or call.get("status"), call.get("disconnection_reason")) if call.get("call_id") else infer_call_status(call),
        "rawStatus": call.get("status") or call.get("call_status"),
        "endedReason": call.get("endedReason") or call.get("disconnection_reason"),
        "type": call.get("type") or call.get("call_type") or "unknown",
        "messageCount": len(transcript_turns),
        "summary": summary,
        "transcript": transcript,
        "transcriptTurns": transcript_turns,
        "recordingUrl": recording_url,
        "recordingMultiChannelUrl": call.get("recording_multi_channel_url"),
        "publicLogUrl": call.get("public_log_url"),
        "knowledgeBaseRetrievedContentsUrl": call.get("knowledge_base_retrieved_contents_url"),
        "cost": cost,
        "costBreakdown": get_nested(call, "costBreakdown", default={}) or call.get("call_cost") or {},
        "costProducts": normalize_call_cost_products(call),
        "analysis": analysis,
        "sentiment": sentiment["value"],
        "sentimentLabel": sentiment["label"],
        "successful": successful,
        "reviewRequired": should_review_call(call),
        "intent": get_nested(analysis, "custom_analysis_data", "intent", default="") or "",
        "direction": call.get("direction") or "",
        "fromNumber": call.get("from_number") or "",
        "toNumber": call.get("to_number") or "",
        "latency": call.get("latency") or {},
        "averageLatencyMs": average_latency_ms(call),
        "retellMetadata": call.get("metadata") or {},
        "dynamicVariables": call.get("retell_llm_dynamic_variables") or call.get("collected_dynamic_variables") or {},
        "artifact": call.get("artifact") or {},
        "raw": call,
    }


def normalize_assistant(assistant: dict[str, Any]) -> dict[str, Any]:
    model = assistant.get("model") or {}
    voice = assistant.get("voice") or {}
    transcriber = assistant.get("transcriber") or {}

    return {
        "id": assistant.get("id") or assistant.get("agent_id"),
        "name": assistant.get("name") or assistant.get("agent_name") or "Unnamed assistant",
        "createdAt": format_iso_datetime(assistant.get("createdAt")),
        "updatedAt": format_iso_datetime(assistant.get("updatedAt")) or retell_timestamp_to_iso(assistant.get("last_modification_timestamp")),
        "modelProvider": model.get("provider") or get_nested(assistant, "response_engine", "type") or "",
        "modelName": model.get("model") or get_nested(assistant, "response_engine", "llm_id") or "",
        "voiceProvider": voice.get("provider") or str(assistant.get("voice_id") or "").split("-", 1)[0],
        "voiceId": voice.get("voiceId") or voice.get("id") or assistant.get("voice_id") or "",
        "transcriberProvider": transcriber.get("provider") or "",
        "transcriberLanguage": transcriber.get("language") or assistant.get("language") or "",
        "firstMessage": assistant.get("firstMessage") or assistant.get("begin_message") or "",
        "endCallMessage": assistant.get("endCallMessage") or assistant.get("end_call_message") or "",
        "raw": assistant,
    }


def unique_assistants(assistants: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique_items: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for assistant in assistants:
        assistant_id = str(assistant.get("id") or "").strip()
        if assistant_id and assistant_id in seen_ids:
            continue
        if assistant_id:
            seen_ids.add(assistant_id)
        unique_items.append(assistant)

    return unique_items


def unique_calls(calls: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique_items: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for call in calls:
        call_id = str(call.get("id") or "").strip()
        if call_id and call_id in seen_ids:
            continue
        if call_id:
            seen_ids.add(call_id)
        unique_items.append(call)

    return unique_items


def normalize_phone_number(phone_number: dict[str, Any]) -> dict[str, Any]:
    inbound_binding = pick_retell_agent_binding(phone_number.get("inbound_agents"))
    outbound_binding = pick_retell_agent_binding(phone_number.get("outbound_agents"))
    binding = inbound_binding or outbound_binding
    number = phone_number.get("number") or phone_number.get("phoneNumber") or phone_number.get("phone_number") or ""

    return {
        "id": phone_number.get("id") or number,
        "number": number or phone_number.get("phone_number_pretty") or "",
        "name": phone_number.get("name") or phone_number.get("nickname") or phone_number.get("provider") or "Phone number",
        "provider": phone_number.get("provider") or phone_number.get("phone_number_type") or "",
        "assistantId": phone_number.get("assistantId") or get_nested(phone_number, "assistant", "id") or binding.get("agent_id"),
        "assistantName": get_nested(phone_number, "assistant", "name") or "",
        "createdAt": format_iso_datetime(phone_number.get("createdAt")),
        "updatedAt": format_iso_datetime(phone_number.get("updatedAt")) or retell_timestamp_to_iso(phone_number.get("last_modification_timestamp")),
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


def normalize_knowledge_base(knowledge_base: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": knowledge_base.get("knowledge_base_id"),
        "name": knowledge_base.get("knowledge_base_name") or "Knowledge base",
        "originalName": knowledge_base.get("knowledge_base_name") or "",
        "status": "done" if knowledge_base.get("status") == "complete" else knowledge_base.get("status") or "",
        "purpose": "knowledge_base",
        "mimetype": "knowledge_base",
        "bytes": sum((source.get("file_size") or 0) for source in knowledge_base.get("knowledge_base_sources") or []),
        "parsedTextBytes": 0,
        "url": "",
        "parsedTextUrl": "",
        "createdAt": retell_timestamp_to_iso(knowledge_base.get("last_refreshed_timestamp")),
        "updatedAt": retell_timestamp_to_iso(knowledge_base.get("last_refreshed_timestamp")),
        "metadata": {"sourceCount": len(knowledge_base.get("knowledge_base_sources") or [])},
        "raw": knowledge_base,
    }


@app.get(f"{API_PREFIX}/voice/assistants")
async def list_voice_assistants(
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    assistants = await retell_api_request(current_user, "GET", "/list-agents")
    return unique_assistants([normalize_assistant(assistant) for assistant in assistants])


@app.get(f"{API_PREFIX}/voice/calls")
async def list_voice_calls(
    limit: int = Query(50, ge=1, le=1000),
    assistant_id: str | None = Query(default=None, alias="assistantId"),
    created_at_ge: str | None = Query(default=None, alias="createdAtGe"),
    created_at_le: str | None = Query(default=None, alias="createdAtLe"),
    current_user: User = Depends(get_current_user),
):
    filter_criteria: dict[str, Any] = {}
    if assistant_id:
        filter_criteria["agent_id"] = [assistant_id]
    if created_at_ge or created_at_le:
        filter_criteria["start_timestamp"] = {}
        if created_at_ge:
            filter_criteria["start_timestamp"]["lower_threshold"] = iso_datetime_to_retell_timestamp(created_at_ge)
        if created_at_le:
            filter_criteria["start_timestamp"]["upper_threshold"] = iso_datetime_to_retell_timestamp(created_at_le)
        filter_criteria["start_timestamp"] = {
            key: value
            for key, value in filter_criteria["start_timestamp"].items()
            if value is not None
        }
        if not filter_criteria["start_timestamp"]:
            filter_criteria.pop("start_timestamp")

    calls = await retell_list_calls(current_user, limit=limit, filter_criteria=filter_criteria)
    return unique_calls([normalize_call(call) for call in calls])


@app.get(f"{API_PREFIX}/voice/calls/{{call_id}}")
async def get_voice_call(call_id: str, current_user: User = Depends(get_current_user)):
    call = await retell_api_request(current_user, "GET", f"/v2/get-call/{call_id}")
    return normalize_call(call)


@app.get(f"{API_PREFIX}/voice/phone-numbers")
async def list_voice_phone_numbers(
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    phone_numbers = await retell_api_list_all(current_user, "GET", "/v2/list-phone-numbers", limit=limit)
    return [normalize_phone_number(phone_number) for phone_number in phone_numbers]


@app.get(f"{API_PREFIX}/voice/files")
async def list_voice_files(current_user: User = Depends(get_current_user)):
    knowledge_bases = await retell_api_request(current_user, "GET", "/list-knowledge-bases")
    files = []
    for knowledge_base in knowledge_bases:
        sources = normalize_knowledge_base_sources(knowledge_base)
        files.extend(sources or [normalize_knowledge_base(knowledge_base)])
    return files


@app.post(f"{API_PREFIX}/voice/files")
async def upload_voice_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    uploaded_file = await voice_api_upload_file(current_user, file)
    return normalize_file(uploaded_file)


@app.delete(f"{API_PREFIX}/voice/files/{{source_id}}")
async def delete_voice_file(
    source_id: str,
    knowledge_base_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
):
    resolved_knowledge_base_id = knowledge_base_id

    if not resolved_knowledge_base_id:
        knowledge_bases = await retell_api_request(current_user, "GET", "/list-knowledge-bases")
        for knowledge_base in knowledge_bases:
            for source in knowledge_base.get("knowledge_base_sources") or []:
                if source.get("source_id") == source_id:
                    resolved_knowledge_base_id = knowledge_base.get("knowledge_base_id")
                    break
            if resolved_knowledge_base_id:
                break

    if not resolved_knowledge_base_id:
        raise HTTPException(status_code=404, detail="Khong tim thay knowledge base cua tai lieu nay")

    knowledge_base = await retell_api_request(
        current_user,
        "DELETE",
        f"/delete-knowledge-base-source/{resolved_knowledge_base_id}/source/{source_id}",
        timeout=60.0,
    )

    return {
        "deleted": True,
        "id": source_id,
        "knowledgeBaseId": resolved_knowledge_base_id,
        "files": normalize_knowledge_base_sources(knowledge_base or {}),
    }


@app.patch(f"{API_PREFIX}/voice/assistants/{{assistant_id}}")
async def update_voice_assistant(
    assistant_id: str,
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    field_map = {
        "name": "agent_name",
        "voiceId": "voice_id",
        "language": "language",
        "metadata": "metadata",
    }
    safe_payload = {
        field_map[key]: value
        for key, value in payload.items()
        if key in field_map
    }

    if not safe_payload:
        raise HTTPException(status_code=400, detail="Khong co truong hop le de cap nhat assistant")

    assistant = await retell_api_request(current_user, "PATCH", f"/update-agent/{assistant_id}", payload=safe_payload)
    return normalize_assistant(assistant)


@app.patch(f"{API_PREFIX}/voice/phone-numbers/{{phone_number_id}}")
async def update_voice_phone_number(
    phone_number_id: str,
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    safe_payload: dict[str, Any] = {}
    if "assistantId" in payload:
        assistant_id = payload.get("assistantId")
        agent_bindings = [{"agent_id": assistant_id, "weight": 1}] if assistant_id else None
        safe_payload["inbound_agents"] = agent_bindings
        safe_payload["outbound_agents"] = agent_bindings
    if "name" in payload:
        safe_payload["nickname"] = payload.get("name")

    if not safe_payload:
        raise HTTPException(status_code=400, detail="Khong co truong hop le de cap nhat phone number")

    phone_number = await retell_api_request(
        current_user,
        "PATCH",
        f"/update-phone-number/{phone_number_id}",
        payload=safe_payload,
    )
    return normalize_phone_number(phone_number)


@app.get(f"{API_PREFIX}/voice/dashboard")
async def get_voice_dashboard(
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    calls = unique_calls([normalize_call(call) for call in await retell_list_calls(current_user, limit=limit)])
    assistants = unique_assistants([
        normalize_assistant(assistant)
        for assistant in await retell_api_request(current_user, "GET", "/list-agents")
    ])
    phone_numbers = [
        normalize_phone_number(phone_number)
        for phone_number in await retell_api_list_all(current_user, "GET", "/v2/list-phone-numbers", limit=100)
    ]
    knowledge_bases = await retell_api_request(current_user, "GET", "/list-knowledge-bases")
    files = []
    for knowledge_base in knowledge_bases:
        sources = normalize_knowledge_base_sources(knowledge_base)
        files.extend(sources or [normalize_knowledge_base(knowledge_base)])

    completed = sum(1 for call in calls if call["status"] == "completed")
    active = sum(1 for call in calls if call["status"] == "active")
    missed = sum(1 for call in calls if call["status"] == "missed")
    transferred = sum(1 for call in calls if call["status"] == "transferred")
    successful = sum(1 for call in calls if call.get("successful") is True)
    review_required = sum(1 for call in calls if call.get("reviewRequired"))
    inbound = sum(1 for call in calls if call.get("direction") == "inbound")
    outbound = sum(1 for call in calls if call.get("direction") == "outbound")
    web_calls = sum(1 for call in calls if call.get("type") == "web_call")
    total_cost = sum(float(call.get("cost") or 0) for call in calls)
    average_duration = (
        sum(float(call.get("durationSeconds") or 0) for call in calls) / len(calls)
        if calls
        else 0
    )
    average_latency = (
        sum(float(call.get("averageLatencyMs") or 0) for call in calls) / len(calls)
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
            "successfulCalls": successful,
            "reviewRequiredCalls": review_required,
            "inboundCalls": inbound,
            "outboundCalls": outbound,
            "webCalls": web_calls,
            "averageDuration": format_duration(average_duration),
            "successRate": round((successful / len(calls)) * 100, 1) if calls else 0,
            "totalCost": round(total_cost, 4),
            "averageLatencyMs": round(average_latency, 1),
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
