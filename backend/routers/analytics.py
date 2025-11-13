from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import datetime
from database import get_db
from models import Book, Loan, Member
from schemas import TopBookResponse, OverdueLoanResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/top-books", response_model=List[TopBookResponse])
def get_top_books(limit: int = 10, db: Session = Depends(get_db)):
    top_books = db.query(Book).order_by(Book.borrowed_count.desc()).limit(limit).all()
    return top_books


@router.get("/overdue-loans", response_model=List[OverdueLoanResponse])
def get_overdue_loans(db: Session = Depends(get_db)):
    today = datetime.now().date()
    
    overdue_loans = db.query(Loan).filter(
        and_(
            Loan.return_date.is_(None),
            Loan.due_date < today
        )
    ).all()
    
    result = []
    for loan in overdue_loans:
        days_overdue = (today - loan.due_date).days
        result.append(
            OverdueLoanResponse(
                loan_id=loan.loan_id,
                book_title=loan.book.title,
                member_name=loan.member.name,
                due_date=loan.due_date,
                days_overdue=days_overdue,
                fine_amount=loan.fine_amount
            )
        )
    
    return result

