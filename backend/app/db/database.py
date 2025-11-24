import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Lấy biến môi trường
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = None

# Logic thông minh: Tự chọn Engine dựa trên biến môi trường
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    # Cấu hình cho PRODUCTION (Supabase/Postgres)
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
else:
    # Cấu hình cho LOCAL (SQLite)
    print("--- Running with Local SQLite ---")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./library.db"
    # [QUAN TRỌNG] check_same_thread=False là bắt buộc cho SQLite
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()