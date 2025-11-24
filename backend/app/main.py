from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv
import os

from app.core.config import settings
from app.db.database import get_db, engine, Base
from app.routers import books, members, loans, analytics, reservations

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

UPLOAD_DIR = "uploaded_books"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploaded_books", StaticFiles(directory=UPLOAD_DIR), name="uploaded_books")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(members.router)
app.include_router(loans.router)
app.include_router(analytics.router)
app.include_router(reservations.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Library Manager API", "status": "ready"}

@app.get("/health/db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"database": "connected", "status": "healthy"}
    except Exception as e:
        return {"database": "disconnected", "error": str(e)}