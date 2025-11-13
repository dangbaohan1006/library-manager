from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import books, members, loans, reservations, analytics
from models import Book, Member
from datetime import datetime

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library Manager API",
    description="API for managing library books, members, loans, and reservations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(books.router)
app.include_router(members.router)
app.include_router(loans.router)
app.include_router(reservations.router)
app.include_router(analytics.router)


@app.on_event("startup")
def seed_database():
    """Seed database with mock data if empty"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        book_count = db.query(Book).count()
        member_count = db.query(Member).count()
        
        if book_count == 0:
            # Add mock books
            mock_books = [
                Book(title="Clean Code", author="Robert C. Martin", quantity=5, borrowed_count=12),
                Book(title="The Pragmatic Programmer", author="Andrew Hunt", quantity=3, borrowed_count=8),
                Book(title="Design Patterns", author="Gang of Four", quantity=4, borrowed_count=15),
                Book(title="Python Crash Course", author="Eric Matthes", quantity=6, borrowed_count=20),
                Book(title="JavaScript: The Good Parts", author="Douglas Crockford", quantity=4, borrowed_count=10),
                Book(title="You Don't Know JS", author="Kyle Simpson", quantity=5, borrowed_count=18),
                Book(title="Eloquent JavaScript", author="Marijn Haverbeke", quantity=3, borrowed_count=7),
                Book(title="Head First Design Patterns", author="Eric Freeman", quantity=4, borrowed_count=11),
                Book(title="Refactoring", author="Martin Fowler", quantity=2, borrowed_count=9),
                Book(title="The Clean Coder", author="Robert C. Martin", quantity=3, borrowed_count=6),
            ]
            db.add_all(mock_books)
            db.commit()
            print("✅ Seeded books successfully")
        
        if member_count == 0:
            # Add mock members
            mock_members = [
                Member(name="Nguyễn Văn A", email="nguyenvana@example.com", join_date=datetime(2023, 1, 15).date()),
                Member(name="Trần Thị B", email="tranthib@example.com", join_date=datetime(2023, 3, 20).date()),
                Member(name="Lê Văn C", email="levanc@example.com", join_date=datetime(2023, 5, 10).date()),
                Member(name="Phạm Thị D", email="phamthid@example.com", join_date=datetime(2023, 7, 5).date()),
                Member(name="Hoàng Văn E", email="hoangvane@example.com", join_date=datetime(2023, 9, 12).date()),
            ]
            db.add_all(mock_members)
            db.commit()
            print("✅ Seeded members successfully")
            
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Library Manager API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

