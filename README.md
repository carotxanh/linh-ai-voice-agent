# Voice Agent - Trợ lý giọng nói AI thời gian thực

Ứng dụng trò chuyện bằng giọng nói với AI, sử dụng công nghệ Speech-to-Text, LLM và Text-to-Speech.

## Tổng quan

Voice Agent là một ứng dụng full-stack cho phép người dùng trò chuyện với AI bằng giọng nói theo thời gian thực. Ứng dụng sử dụng:

- **Frontend**: React + Vite với WebSocket để streaming audio
- **Backend**: FastAPI với WebSocket server
- **STT**: ElevenLabs Scribe v2 (Speech-to-Text)
- **LLM**: Google Gemini 2.5 Flash Lite
- **TTS**: ElevenLabs Text-to-Speech

## Kiến trúc hệ thống

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │◄──────────────────────────►│                  │
│   Frontend      │    Audio + Transcripts     │    Backend       │
│   (React)       │                            │    (FastAPI)     │
│                 │                            │                  │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    │                   │                   │
                              ┌─────▼──────┐     ┌─────▼──────┐     ┌─────▼──────┐
                              │ ElevenLabs │     │   Gemini   │     │ ElevenLabs │
                              │    STT     │     │    LLM     │     │    TTS     │
                              └────────────┘     └────────────┘     └────────────┘
```

## Luồng hoạt động

1. Người dùng nói vào microphone
2. Frontend capture audio và gửi qua WebSocket đến Backend
3. Backend gửi audio đến ElevenLabs STT
4. STT trả về transcript (partial + committed)
5. Backend gửi transcript đến Gemini LLM
6. LLM tạo response text
7. Backend gửi text đến ElevenLabs TTS
8. TTS trả về audio
9. Backend gửi audio về Frontend để phát

## Yêu cầu hệ thống

- **Node.js**: 18+ (cho Frontend)
- **Python**: 3.8+ (cho Backend)
- **API Keys**:
  - ElevenLabs API key (https://elevenlabs.io/app/settings/api-keys)
  - Google Gemini API key (https://aistudio.google.com/app/apikey)

## Cài đặt nhanh

### 1. Clone repository

```bash
git clone <repository-url>
cd linh-ai-voice-agent
```

### 2. Cài đặt Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv
#Conda
conda create -n venv python=3.10

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
#Conda
conda activate venv

# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình environment
copy .env.example .env
# Chỉnh sửa .env và thêm API keys

# Chạy server
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`

### 3. Cài đặt Frontend

Mở terminal mới:

```bash
cd frontend

# Cấu hình environment
copy .env.example .env
# Chỉnh sửa .env và thêm API keys

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## Cấu hình

### Backend (.env)

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_MODEL_ID=scribe_v2_realtime
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_LANGUAGE=vi

# Gemini Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

# LLM Parameters
LLM_MAX_TOKENS=150
LLM_TEMPERATURE=0.7

# VAD Settings
VAD_THRESHOLD=0.4
VAD_SILENCE_DURATION=1.5
```

### Frontend (.env)

```bash
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/audio-stream
```

## Sử dụng

1. Mở trình duyệt tại `http://localhost:5173`
2. Click nút "Start" để bắt đầu ghi âm
3. Nói vào microphone
4. Xem transcript hiển thị real-time
5. Nghe phản hồi từ AI
6. Click "Stop" để dừng

## Cấu trúc thư mục

```
linh-ai-voice-agent/
├── backend/                    # FastAPI backend
│   ├── core/                  # Core modules
│   │   ├── config.py         # Configuration
│   │   ├── models.py         # Data models
│   │   └── websocket_handler.py
│   ├── services/             # External services
│   │   ├── elevenlabs_stt.py
│   │   ├── elevenlabs_tts.py
│   │   └── llm_engine.py
│   ├── main.py               # Entry point
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── Microphone.jsx
│   │   │   ├── Transcript.jsx
│   │   │   └── Waveform.jsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useScribe.js
│   │   ├── pages/           # Page components
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
└── README.md                 # File này
```

## Tính năng

- ✅ Real-time speech-to-text
- ✅ Voice Activity Detection (VAD)
- ✅ Partial và committed transcripts
- ✅ LLM conversation với context
- ✅ Text-to-speech response
- ✅ WebSocket bidirectional streaming
- ✅ Visual waveform display
- ✅ Responsive UI

## Troubleshooting

### Backend không kết nối được ElevenLabs
- Kiểm tra API key trong `backend/.env`
- Verify quota tại https://elevenlabs.io/app/usage

### Frontend không kết nối được Backend
- Kiểm tra Backend đang chạy tại port 8000
- Verify WebSocket URL trong `frontend/.env`
- Kiểm tra CORS settings trong `backend/.env`

### Microphone không hoạt động
- Cho phép trình duyệt truy cập microphone
- Kiểm tra microphone settings trong hệ thống
- Thử trình duyệt khác (Chrome/Edge khuyến nghị)

### VAD quá nhạy hoặc không nhạy
- Điều chỉnh `VAD_THRESHOLD` trong `backend/.env`
- Giá trị thấp hơn = nhạy hơn (0.01 - 0.5)
- Điều chỉnh `VAD_SILENCE_DURATION` cho độ trễ

## Development

### Backend Development

```bash
cd backend
python main.py  # Auto-reload enabled
```

### Frontend Development

```bash
cd frontend
npm run dev     # Hot module replacement
```


## Tài liệu tham khảo

- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
