# LINH AI - LinhVoice

AI voice agent dashboard for managing calls, assistants, phone numbers, files, and per-account voice API credentials.

## Architecture

```text
linh-ai-voice-agent/
├── backend/                 # FastAPI, JWT auth, PostgreSQL/Supabase, voice API proxy
├── frontend/                # React + Vite dashboard
├── docker-compose.yml       # Local build compose
└── docker-compose.prod.yml  # VPS compose using prebuilt images
```

The frontend always calls the backend through `/api` on the same domain. In production, host Nginx handles TLS and proxies:

```text
https://linhvoice.io.vn/      -> 127.0.0.1:8080 -> frontend container
https://linhvoice.io.vn/api/  -> 127.0.0.1:8000 -> backend container
```

Each LinhVoice account stores its own encrypted voice API key in the database. Do not configure a shared `VOICE_API_KEY` in `.env`.

## Environment

Create `backend/.env` from `backend/.env.example`:

```env
API_PREFIX=/api
DATABASE_URL=postgresql+psycopg2://<SUPABASE_DB_USER>:<SUPABASE_DB_PASSWORD>@<SUPABASE_POOLER_HOST>:5432/postgres
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
DATA_ENCRYPTION_KEY=paste_generated_fernet_key_here
VOICE_API_BASE_URL=https://api.vapi.ai
```

Generate `DATA_ENCRYPTION_KEY`:

```powershell
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

`DATABASE_URL` should come from Supabase. The backend automatically enables SSL for Supabase pooler hosts.

## Local Development

Backend:

```powershell
conda create -n linh-voice python=3.11
conda activate linh-voice
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Create `frontend/.env` for local dev:

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

Open:

```text
http://localhost:5173
```

## Create Or Update A User

Run from `backend/`:

```powershell
python scripts\create_user.py --email owner@company.com --full-name "Company Owner"
```

The script asks for password and voice API key using hidden prompts. The voice key is encrypted and stored on that user, not in `.env`.

## Docker Deployment Model

The recommended VPS flow is to build Docker images locally, export them to a `.tar`, upload only the tar + compose file + `.env`, then run the images on the VPS.

This avoids sending source code, `node_modules`, build contexts, or dependency install work to the VPS.

## First Deploy To VPS

### 1. Prepare DNS

Point the `A` record:

```text
linhvoice.io.vn -> <VPS_IP>
```

Only add `www.linhvoice.io.vn` if you also create a DNS record for `www`. Otherwise do not include `www` in Nginx or Certbot.

### 2. Install Docker, Nginx, Certbot On VPS

SSH into the VPS:

```bash
ssh root@<VPS_IP>
```

Install:

```bash
apt update
apt install -y ca-certificates curl nginx certbot python3-certbot-nginx
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

### 3. Clean Old Deployment On VPS

Use this when rebuilding from scratch:

```bash
cd /opt/linhvoice || true
docker compose down -v --remove-orphans || true
docker rm -f linh-voice-backend linh-voice-frontend linh-voice-postgres || true
docker rmi -f linhvoice-backend:latest linhvoice-frontend:latest || true
docker network prune -f
docker volume prune -f
rm -rf /opt/linhvoice
mkdir -p /opt/linhvoice/backend
```

### 4. Build Images Locally

Run on your local machine:

```powershell
cd D:\linh-ai-voice-agent

docker build -t linhvoice-backend:latest .\backend
docker build -t linhvoice-frontend:latest .\frontend

docker save linhvoice-backend:latest linhvoice-frontend:latest -o linhvoice-images.tar
```

### 5. Upload Minimal Files

From local machine:

```powershell
scp .\linhvoice-images.tar root@<VPS_IP>:/opt/linhvoice/
scp .\docker-compose.prod.yml root@<VPS_IP>:/opt/linhvoice/docker-compose.yml
scp .\backend\.env root@<VPS_IP>:/opt/linhvoice/backend/.env
```

### 6. Load And Run Images On VPS

```bash
cd /opt/linhvoice

docker load -i linhvoice-images.tar
docker images | grep linhvoice

docker compose up -d
docker compose ps
```

Expected local ports:

```text
127.0.0.1:8000 -> backend
127.0.0.1:8080 -> frontend
```

Test internally:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8080
```

### 7. Configure Host Nginx

Create:

```bash
nano /etc/nginx/sites-available/linhvoice.io.vn
```

Use this config if you only have DNS for `linhvoice.io.vn`:

```nginx
server {
    listen 80;
    server_name linhvoice.io.vn;

    client_max_body_size 25m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
ln -sf /etc/nginx/sites-available/linhvoice.io.vn /etc/nginx/sites-enabled/linhvoice.io.vn
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 8. Request SSL With Certbot

If only root domain DNS exists:

```bash
certbot --nginx -d linhvoice.io.vn
```

Only use `www` after adding DNS for `www.linhvoice.io.vn`:

```bash
certbot --nginx -d linhvoice.io.vn -d www.linhvoice.io.vn
```

Test renewal:

```bash
certbot renew --dry-run
```

### 9. Verify Public Access

```bash
curl https://linhvoice.io.vn/api/health
curl https://linhvoice.io.vn/api/health/database
```

Open:

```text
https://linhvoice.io.vn
```

## Updating Later

Build and export locally:

```powershell
cd D:\linh-ai-voice-agent

docker build -t linhvoice-backend:latest .\backend
docker build -t linhvoice-frontend:latest .\frontend
docker save linhvoice-backend:latest linhvoice-frontend:latest -o linhvoice-images.tar
```

Upload only the new image tar:

```powershell
scp .\linhvoice-images.tar root@<VPS_IP>:/opt/linhvoice/
```

Restart on VPS:

```bash
cd /opt/linhvoice

docker compose down
docker load -i linhvoice-images.tar
docker compose up -d
docker image prune -f
docker compose ps
```

If `backend/.env` changed, upload it too:

```powershell
scp .\backend\.env root@<VPS_IP>:/opt/linhvoice/backend/.env
```

Then restart:

```bash
cd /opt/linhvoice
docker compose restart backend
```

## Useful VPS Commands

Logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Restart:

```bash
docker compose restart
```

Stop:

```bash
docker compose down
```

Check Nginx:

```bash
nginx -t
systemctl status nginx
systemctl reload nginx
```
