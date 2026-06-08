import os
from datetime import datetime
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
AGENT_ID = os.getenv("AGENT_ID")
VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_API_BASE_URL = os.getenv("VAPI_API_BASE_URL", "https://api.vapi.ai").rstrip("/")

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


def require_vapi_api_key() -> str:
    if not VAPI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="VAPI_API_KEY chua duoc cau hinh trong .env",
        )
    return VAPI_API_KEY


async def vapi_get(path: str, params: dict[str, Any] | None = None) -> Any:
    token = require_vapi_api_key()
    url = f"{VAPI_API_BASE_URL}{path}"

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
                detail=f"Khong the ket noi toi Vapi API: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Vapi API loi: {response.text}",
        )

    return response.json()


async def vapi_patch(path: str, payload: dict[str, Any]) -> Any:
    token = require_vapi_api_key()
    url = f"{VAPI_API_BASE_URL}{path}"

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
                detail=f"Khong the ket noi toi Vapi API: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Vapi API loi: {response.text}",
        )

    return response.json()


async def vapi_upload_file(file: UploadFile) -> Any:
    token = require_vapi_api_key()
    content = await file.read()

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{VAPI_API_BASE_URL}/file",
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
                detail=f"Khong the upload file toi Vapi API: {str(e)}",
            )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Vapi API loi: {response.text}",
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
    summary = get_nested(call, "analysis", "summary") or call.get("summary") or "Chua co tom tat tu Vapi."
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
        "name": file.get("name") or file.get("originalName") or "Vapi file",
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


@app.get("/api/vapi/assistants")
async def list_vapi_assistants(limit: int = Query(100, ge=1, le=1000)):
    assistants = await vapi_get("/assistant", {"limit": limit})
    return [normalize_assistant(assistant) for assistant in assistants]


@app.get("/api/vapi/calls")
async def list_vapi_calls(
    limit: int = Query(50, ge=1, le=1000),
    assistant_id: str | None = Query(default=None, alias="assistantId"),
    created_at_ge: str | None = Query(default=None, alias="createdAtGe"),
    created_at_le: str | None = Query(default=None, alias="createdAtLe"),
):
    calls = await vapi_get(
        "/call",
        {
            "limit": limit,
            "assistantId": assistant_id,
            "createdAtGe": created_at_ge,
            "createdAtLe": created_at_le,
        },
    )
    return [normalize_call(call) for call in calls]


@app.get("/api/vapi/calls/{call_id}")
async def get_vapi_call(call_id: str):
    call = await vapi_get(f"/call/{call_id}")
    return normalize_call(call)


@app.get("/api/vapi/phone-numbers")
async def list_vapi_phone_numbers(limit: int = Query(100, ge=1, le=1000)):
    phone_numbers = await vapi_get("/phone-number", {"limit": limit})
    return [normalize_phone_number(phone_number) for phone_number in phone_numbers]


@app.get("/api/vapi/files")
async def list_vapi_files():
    files = await vapi_get("/file")
    return [normalize_file(file) for file in files]


@app.post("/api/vapi/files")
async def upload_vapi_file(file: UploadFile = File(...)):
    uploaded_file = await vapi_upload_file(file)
    return normalize_file(uploaded_file)


@app.patch("/api/vapi/assistants/{assistant_id}")
async def update_vapi_assistant(assistant_id: str, payload: dict[str, Any]):
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

    assistant = await vapi_patch(f"/assistant/{assistant_id}", safe_payload)
    return normalize_assistant(assistant)


@app.patch("/api/vapi/phone-numbers/{phone_number_id}")
async def update_vapi_phone_number(phone_number_id: str, payload: dict[str, Any]):
    allowed_fields = {"assistantId", "name", "fallbackDestination", "server"}
    safe_payload = {key: value for key, value in payload.items() if key in allowed_fields}

    if not safe_payload:
        raise HTTPException(status_code=400, detail="Khong co truong hop le de cap nhat phone number")

    phone_number = await vapi_patch(f"/phone-number/{phone_number_id}", safe_payload)
    return normalize_phone_number(phone_number)


@app.get("/api/vapi/dashboard")
async def get_vapi_dashboard(limit: int = Query(50, ge=1, le=1000)):
    calls = [normalize_call(call) for call in await vapi_get("/call", {"limit": limit})]
    assistants = [normalize_assistant(assistant) for assistant in await vapi_get("/assistant", {"limit": 100})]
    phone_numbers = [normalize_phone_number(phone_number) for phone_number in await vapi_get("/phone-number", {"limit": 100})]
    files = [normalize_file(file) for file in await vapi_get("/file")]

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
