# LINH AI - LinhVoice

Trợ lý giọng nói AI cho doanh nghiệp Việt, tập trung vào quản lý cuộc gọi, trợ lý AI, hotline và kho dữ liệu vận hành.

## Kiến trúc

```text
linh-ai-voice-agent/
├── backend/          # FastAPI, JWT auth, PostgreSQL, voice data proxy
├── frontend/         # React + Vite dashboard
└── docker-compose.yml
```

Mỗi tài khoản LinhVoice có một khóa kết nối thoại riêng. Khóa này được mã hóa rồi lưu trong PostgreSQL, không cấu hình cứng trong `.env`.

## Chạy PostgreSQL bằng Docker

```powershell
docker compose up -d postgres
docker compose ps
```

Database mặc định:

```env
DATABASE_URL=postgresql+psycopg2://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>
```

## Backend

```powershell
conda create -n linh-voice python=3.11
conda activate linh-voice
cd backend
pip install -r requirements.txt
```

Tạo khóa mã hóa dữ liệu:

```powershell
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Tạo `backend/.env`:

```env
API_PREFIX=/api
DATABASE_URL=postgresql+psycopg2://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
DATA_ENCRYPTION_KEY=paste_generated_fernet_key_here
VOICE_API_KEY=replace_with_voice_api_key
VOICE_API_BASE_URL=https://api.vapi.ai
```

Chạy backend:

```powershell
uvicorn main:app --reload --port 8000
```

Backend sẽ tự tạo bảng `users` và bổ sung các cột cần thiết khi khởi động.

## Tạo tài khoản thủ công kèm khóa kết nối

Chạy từ thư mục `backend`:

```powershell
python scripts\create_user.py --email owner@company.com --full-name "Company Owner"
```

Script sẽ hỏi mật khẩu và khóa kết nối bằng prompt ẩn để tránh lưu secret trong terminal history. Nếu email đã tồn tại, script sẽ cập nhật mật khẩu, tên và khóa kết nối mới cho tài khoản đó.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend luôn gọi backend qua `/api` trên cùng domain. Khi chạy local, Vite proxy `/api` theo `frontend/.env`:

```env
VITE_API_BASE_URL=/api
```

Khi deploy, reverse proxy của domain chuyển `/api/*` tới FastAPI; frontend không cần hostname backend riêng.

Mở `http://localhost:5173`.

## Ghi chú sản phẩm

- Chủ doanh nghiệp đăng nhập bằng tài khoản LinhVoice.
- Mỗi tài khoản có một khóa kết nối thoại riêng trong PostgreSQL.
- Trợ lý AI nên chia theo nghiệp vụ như Sale, CSKH, Đặt lịch, Thu hồi công nợ hoặc chi nhánh.
- Nhân viên nên là tài khoản vận hành riêng, không nhất thiết tạo một trợ lý AI riêng cho từng người.
