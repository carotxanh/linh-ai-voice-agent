import argparse
import getpass
import os
import sys
from pathlib import Path

import bcrypt
from cryptography.fernet import Fernet
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate SQL to create/update a Supabase user with encrypted Retell API key."
    )
    parser.add_argument("--email", required=True)
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--password")
    parser.add_argument("--api-key")
    parser.add_argument("--api-base-url", default=os.getenv("VOICE_API_BASE_URL", "https://api.retellai.com"))
    return parser.parse_args()


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main():
    args = parse_args()
    encryption_key = os.getenv("DATA_ENCRYPTION_KEY")
    if not encryption_key:
        raise SystemExit("Missing DATA_ENCRYPTION_KEY in backend/.env")

    email = args.email.strip().lower()
    full_name = args.full_name.strip()
    password = args.password or getpass.getpass("Password: ")
    api_key = args.api_key or getpass.getpass("Retell API key: ")
    api_base_url = args.api_base_url.strip().rstrip("/")

    if not email or "@" not in email:
        raise SystemExit("Email khong hop le")
    if len(password) < 8:
        raise SystemExit("Mat khau phai co it nhat 8 ky tu")
    if not full_name:
        raise SystemExit("Vui long nhap ten nguoi dung")
    if len(api_key.strip()) < 12:
        raise SystemExit("Retell API key qua ngan")
    if not api_base_url.startswith(("http://", "https://")):
        raise SystemExit("API base URL khong hop le")

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    encrypted_api_key = Fernet(encryption_key.encode("utf-8")).encrypt(api_key.strip().encode("utf-8")).decode("utf-8")

    sql = f"""INSERT INTO users (
  email,
  full_name,
  role,
  hashed_password,
  voice_api_key_encrypted,
  voice_api_base_url,
  is_active
) VALUES (
  {sql_quote(email)},
  {sql_quote(full_name)},
  'owner',
  {sql_quote(hashed_password)},
  {sql_quote(encrypted_api_key)},
  {sql_quote(api_base_url)},
  true
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  hashed_password = EXCLUDED.hashed_password,
  voice_api_key_encrypted = EXCLUDED.voice_api_key_encrypted,
  voice_api_base_url = EXCLUDED.voice_api_base_url,
  is_active = true,
  updated_at = now();
"""
    sys.stdout.write(sql)


if __name__ == "__main__":
    main()
