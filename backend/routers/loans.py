from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import datetime, timedelta
from database import get_db
from models import Loan, Book, Member
from schemas import LoanCreate, LoanResponse, ReturnRequest
from constants import LoanLimits, FineRates

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post("/borrow", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def borrow_book(loan: LoanCreate, db: Session = Depends(get_db)):
    # Check if book exists and has available quantity
    book = db.query(Book).filter(Book.book_id == loan.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    available_quantity = book.quantity - db.query(Loan).filter(
        and_(Loan.book_id == loan.book_id, Loan.return_date.is_(None))
    ).count()
    
    if available_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book is not available"
        )
    
    # Check if member exists
    member = db.query(Member).filter(Member.member_id == loan.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # Check member's current loan count
    active_loans = db.query(Loan).filter(
        and_(Loan.member_id == loan.member_id, Loan.return_date.is_(None))
    ).count()
    
    if active_loans >= LoanLimits.MAX_BOOKS_PER_MEMBER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Member has reached the maximum limit of {LoanLimits.MAX_BOOKS_PER_MEMBER} books"
        )
    
    # Create loan
    loan_date = datetime.now().date()
    due_date = loan_date + timedelta(days=LoanLimits.LOAN_DURATION_DAYS)
    
    db_loan = Loan(
        book_id=loan.book_id,
        member_id=loan.member_id,
        loan_date=loan_date,
        due_date=due_date
    )
    
    # Update book borrowed count
    book.borrowed_count += 1
    
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    
    return db_loan


@router.post("/return", response_model=LoanResponse)
def return_book(return_req: ReturnRequest, db: Session = Depends(get_db)):
    # Find the loan
    loan = db.query(Loan).filter(Loan.loan_id == return_req.loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    if loan.return_date is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book has already been returned"
        )
    
    # Update return date and calculate fine
    return_date = datetime.now().date()
    loan.return_date = return_date
    
    if return_date > loan.due_date:
        days_overdue = (return_date - loan.due_date).days
        loan.fine_amount = days_overdue * FineRates.FINE_PER_DAY
    
    db.commit()
    db.refresh(loan)
    
    return loan


@router.get("", response_model=List[LoanResponse])
def get_loans(db: Session = Depends(get_db)):
    loans = db.query(Loan).all()
    return loans


@router.get("/active", response_model=List[LoanResponse])
def get_active_loans(db: Session = Depends(get_db)):
    loans = db.query(Loan).filter(Loan.return_date.is_(None)).all()
    return loans

