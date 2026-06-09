import argparse
import getpass
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import (  # noqa: E402
    DEFAULT_VOICE_API_BASE_URL,
    Base,
    SessionLocal,
    User,
    engine,
    encrypt_secret,
    ensure_user_columns,
    hash_password,
    normalize_email,
)


def parse_args():
    parser = argparse.ArgumentParser(description="Create or update a LinhVoice owner account.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password")
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--api-key")
    parser.add_argument("--api-base-url", default=DEFAULT_VOICE_API_BASE_URL)
    return parser.parse_args()


def main():
    args = parse_args()
    email = normalize_email(args.email)
    full_name = args.full_name.strip()
    password = args.password or getpass.getpass("Password: ")
    api_key = args.api_key or getpass.getpass("Voice connection key: ")
    api_key = api_key.strip()
    api_base_url = args.api_base_url.strip().rstrip("/")

    if not email or "@" not in email:
        raise SystemExit("Email khong hop le")
    if len(password) < 8:
        raise SystemExit("Mat khau phai co it nhat 8 ky tu")
    if not full_name:
        raise SystemExit("Vui long nhap ten nguoi dung")
    if len(api_key) < 12:
        raise SystemExit("Khoa ket noi qua ngan")
    if not api_base_url.startswith(("http://", "https://")):
        raise SystemExit("Dia chi ket noi khong hop le")

    Base.metadata.create_all(bind=engine)
    ensure_user_columns()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.full_name = full_name
            user.hashed_password = hash_password(password)
            user.voice_api_key_encrypted = encrypt_secret(api_key)
            user.voice_api_base_url = api_base_url
            user.is_active = True
            action = "updated"
        else:
            user = User(
                email=email,
                full_name=full_name,
                role="owner",
                hashed_password=hash_password(password),
                voice_api_key_encrypted=encrypt_secret(api_key),
                voice_api_base_url=api_base_url,
                is_active=True,
            )
            db.add(user)
            action = "created"

        db.commit()
        db.refresh(user)
        print(f"{action}: {user.email} (id={user.id})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
