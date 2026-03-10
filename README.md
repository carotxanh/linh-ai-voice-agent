# LINH AI — AI Voice Agent cho doanh nghiệp Việt

> Trợ lý giọng nói AI giúp doanh nghiệp không bỏ lỡ khách hàng 24/7.
> Giải nhì VNPT AI Hackathon 2026.

## Kiến trúc

```
linh-project/
├── backend/          # FastAPI server
│   ├── .env          # ELEVENLABS_API_KEY + AGENT_ID
│   ├── main.py       # GET /api/signed-url
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
conda createe -n linh-project python=3.10
conda activate linh-project
```

```bash
cd backend
pip install -r requirements.txt
```

Tạo file `.env`:
```env
ELEVENLABS_API_KEY=your_api_key_here
AGENT_ID=your_agent_id_here
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
| AI Agent | ElevenLabs Conversational AI        |

## Yêu cầu

- Python 3.10+
- Node.js 18+
- Tài khoản [ElevenLabs](https://elevenlabs.io/) với Agent đã tạo
