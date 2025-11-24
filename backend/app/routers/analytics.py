from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_
from datetime import date
from typing import List, Any

from app.db.database import get_db
from app.models import Book, Member, Loan, LoanStatus, Fine

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_books = db.query(Book).count()
    total_members = db.query(Member).count()
    
    active_loans = db.query(Loan).filter(
        Loan.status == LoanStatus.ACTIVE
    ).count()

    overdue_loans = db.query(Loan).filter(
        and_(
            Loan.return_date == None,
            Loan.due_date < date.today()
        )
    ).count()

    pending_fines = db.query(func.sum(Fine.amount)).filter(
        Fine.status == "pending"
    ).scalar() or 0

    return {
        "total_books": total_books,
        "total_members": total_members,
        "active_loans": active_loans,
        "overdue_loans": overdue_loans,
        "pending_fines": float(pending_fines)
    }

@router.get("/top-books")
def get_top_books(limit: int = 5, db: Session = Depends(get_db)):
    
    results = db.query(
        Book, 
        func.count(Loan.id).label('total_loans')
    ).join(Loan).group_by(Book.id).order_by(desc('total_loans')).limit(limit).all()

    response = []
    for book, count in results:
        response.append({
            "book_title": book.title,
            "author": book.author,
            "isbn": book.isbn,
            "total_loans": count,
            "available_copies": book.available_copies
        })
    
    return response

@router.get("/overdue-list")
def get_overdue_loans_detail(db: Session = Depends(get_db)):
    today = date.today()
    
    overdue_loans = db.query(Loan).options(
        joinedload(Loan.book),
        joinedload(Loan.member)
    ).filter(
        and_(
            Loan.return_date == None,
            Loan.due_date < today
        )
    ).all()

    response = []
    for loan in overdue_loans:
        days_overdue = (today - loan.due_date).days
        response.append({
            "loan_id": loan.id,
            "member_name": loan.member.full_name,
            "member_email": loan.member.email,
            "book_title": loan.book.title if loan.book else "Unknown Book",
            "due_date": loan.due_date,
            "days_overdue": days_overdue,
            "estimated_fine": days_overdue * 5000
        })
        
    return response