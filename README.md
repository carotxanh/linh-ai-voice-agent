# LINH AI — AI Voice Agent cho doanh nghiệp Việt

> Trợ lý giọng nói AI giúp doanh nghiệp không bỏ lỡ khách hàng 24/7.
> Giải nhì VNPT AI Hackathon 2026.

## Kiến trúc

```
linh-project/
├── backend/          # FastAPI server
│   ├── .env          # ELEVENLABS_API_KEY + AGENT_ID + VAPI_API_KEY
│   ├── main.py       # ElevenLabs signed URL + Vapi API proxy
│   └── requirements.txt
└── frontend/         # React + Vite
    ├── src/
    │   ├── App.jsx   # UI + ElevenLabs voice integration
    │   └── index.css
    └── package.json
```

## Cài đặt & Chạy

### 1. Backend

Tạo môi trường
```bash
conda create -n linh-voice python=3.11
conda activate linh-voice
```

```bash
cd backend
pip install -r requirements.txt
```

Tạo file `.env`:
```env
VAPI_API_KEY=your_vapi_api_key_here
# Optional, default: https://api.vapi.ai
VAPI_API_BASE_URL=https://api.vapi.ai
```

Chạy server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Nếu backend không chạy ở `http://localhost:8000`, tạo `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Mở trình duyệt tại `http://localhost:5173`.

## Sử dụng

1. Click vào **nút điện thoại** trên hero panel
2. Cho phép truy cập microphone
3. Nói chuyện với LINH AI
4. Click lại để kết thúc cuộc hội thoại

## Tech Stack

| Layer    | Công nghệ                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, @elevenlabs/react   |
| Backend  | FastAPI, httpx, python-dotenv       |
| AI Agent | ElevenLabs Conversational AI, Vapi  |

## Yêu cầu

- Python 3.10+
- Node.js 18+
- Tài khoản [ElevenLabs](https://elevenlabs.io/) với Agent đã tạo
- Vapi API key trong [Vapi Dashboard](https://dashboard.vapi.ai/)
