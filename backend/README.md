# Backend - Voice Agent API

Backend FastAPI cho ứng dụng trò chuyện giọng nói thời gian thực với AI.

## Tính năng

- Streaming audio thời gian thực qua WebSocket
- Chuyển giọng nói thành văn bản (STT) sử dụng ElevenLabs Scribe
- Tích hợp LLM (Gemini) để tạo phản hồi thông minh
- Chuyển văn bản thành giọng nói (TTS) sử dụng ElevenLabs
- Quản lý API key an toàn qua biến môi trường
- Hỗ trợ Voice Activity Detection (VAD)

## Yêu cầu hệ thống

- Python 3.10+
- pip hoặc conda
- API keys từ ElevenLabs và Google Gemini

## Cài đặt

### 1. Tạo môi trường ảo (khuyến nghị)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình biến môi trường

```bash
# Sao chép file mẫu
copy .env.example .env

# Chỉnh sửa file .env và thêm API keys của bạn
```

Các biến môi trường bắt buộc:
- `ELEVENLABS_API_KEY` - Lấy từ https://elevenlabs.io/app/settings/api-keys
- `GEMINI_API_KEY` - Lấy từ https://aistudio.google.com/app/apikey

### 4. Chạy server

```bash
python main.py
```

Server sẽ chạy tại `http://localhost:8000`

## Cấu trúc thư mục

```
backend/
├── main.py                      # Entry point của FastAPI app
├── requirements.txt             # Python dependencies
├── .env.example                 # Template cho biến môi trường
├── .env                         # Biến môi trường (không commit)
├── core/
│   ├── config.py               # Quản lý cấu hình từ .env
│   ├── models.py               # Pydantic models cho validation
│   └── websocket_handler.py    # Xử lý WebSocket và orchestrate pipeline
└── services/
    ├── elevenlabs_stt.py       # ElevenLabs Speech-to-Text
    ├── elevenlabs_tts.py       # ElevenLabs Text-to-Speech
    └── llm_engine.py           # Gemini LLM integration
```

## API Endpoints

### HTTP Endpoints

- `GET /` - Health check đơn giản
- `GET /health` - Trạng thái chi tiết của các services

### WebSocket Endpoint

- `WS /ws/audio-stream` - Endpoint chính cho streaming audio

## WebSocket Protocol

### Messages từ Frontend → Backend

**Audio Chunk (PCM 16-bit, 16kHz):**
```json
{
  "type": "audio",
  "data": "base64_encoded_pcm_data",
  "timestamp": 1234567890.123
}
```

**Speech End Signal:**
```json
{
  "type": "speech_end",
  "timestamp": 1234567890.123
}
```

**Configuration:**
```json
{
  "type": "config",
  "modelId": "scribe_v2_realtime",
  "commitStrategy": "vad",
  "vadThreshold": 0.01
}
```

### Messages từ Backend → Frontend

**Partial Transcript (đang nhận diện):**
```json
{
  "type": "transcript_partial",
  "text": "Xin chào tôi là...",
  "timestamp": 1234567890.123
}
```

**Committed Transcript (hoàn thành):**
```json
{
  "type": "transcript_committed",
  "text": "Xin chào tôi là Linh",
  "timestamp": 1234567890.123,
  "is_final": true
}
```

**Audio Response (TTS):**
```json
{
  "type": "audio",
  "data": "base64_encoded_audio",
  "format": "mp3",
  "sample_rate": 22050
}
```

**Status Update:**
```json
{
  "type": "status",
  "state": "listening|thinking|speaking|idle",
  "message": "Processing audio"
}
```

**Error:**
```json
{
  "type": "error",
  "code": "STT_ERROR|LLM_ERROR|TTS_ERROR",
  "message": "Chi tiết lỗi"
}
```

## Luồng xử lý (Pipeline)

```
1. Frontend gửi audio chunks → WebSocket
2. Backend buffer audio → ElevenLabs STT
3. STT trả về transcript (partial + committed)
4. Committed transcript → Gemini LLM
5. LLM response → ElevenLabs TTS
6. TTS audio → Frontend qua WebSocket
```

## Cấu hình nâng cao

Chỉnh sửa file `.env` để tùy chỉnh:

```bash
# ElevenLabs STT
ELEVENLABS_MODEL_ID=scribe_v2_realtime
ELEVENLABS_LANGUAGE=vi              # vi, en, es, fr, etc.

# Gemini LLM
GEMINI_MODEL=gemini-2.5-flash-lite
LLM_MAX_TOKENS=150
LLM_TEMPERATURE=0.7
LLM_STREAM=true

# Voice Activity Detection
VAD_THRESHOLD=0.4                   # 0.0-1.0, thấp hơn = nhạy hơn
VAD_SILENCE_DURATION=1.5            # giây

# Audio
SAMPLE_RATE=16000                   # Hz

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Testing

### Test HTTP endpoints

```bash
# Health check
curl http://localhost:8000/

# Detailed health
curl http://localhost:8000/health
```

### Test WebSocket (cần wscat)

```bash
# Cài wscat
npm install -g wscat

# Kết nối
wscat -c ws://localhost:8000/ws/audio-stream
```

## Troubleshooting

### Lỗi kết nối ElevenLabs
- Kiểm tra API key trong `.env`
- Verify quota tại https://elevenlabs.io/app/usage

### Lỗi Gemini API
- Kiểm tra API key tại https://aistudio.google.com/app/apikey
- Verify model name (gemini-2.5-flash-lite)

### WebSocket disconnect
- Kiểm tra CORS settings
- Verify frontend URL trong `CORS_ORIGINS`

## Development

### Logging
Backend sử dụng Python logging. Xem logs trong console khi chạy server.

### Hot reload
Server tự động reload khi code thay đổi (uvicorn reload mode).

## Bảo mật

- Không commit file `.env` vào Git
- File `.env.example` chỉ chứa placeholders
- API keys được load từ environment variables
- CORS được cấu hình chặt chẽ

## License

MIT
