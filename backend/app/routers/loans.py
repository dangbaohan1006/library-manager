from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import timedelta, date
from typing import List

from app.db.database import get_db
from app.models import Loan, Book, Member, Fine, LoanStatus, FineStatus
from app.schemas import LoanCreate, LoanResponse
from app.core.constants import LoanLimits, FineRates

router = APIRouter(
    prefix="/loans",
    tags=["Loans"],
    responses={404: {"description": "Not found"}},
)
@router.post("/borrow", response_model=LoanResponse)
def borrow_book(loan_in: LoanCreate, db: Session = Depends(get_db)):
    try:
        member = db.query(Member).filter(Member.id == loan_in.member_id).with_for_update().first()
        if not member or not member.is_active:
             raise HTTPException(status_code=400, detail="Member invalid")

        active_loans_count = db.query(Loan).filter(
            Loan.member_id == loan_in.member_id,
            Loan.status == LoanStatus.ACTIVE
        ).count()
        
        if active_loans_count >= LoanLimits.MAX_BOOKS_PER_MEMBER:
            raise HTTPException(status_code=400, detail="Limit reached")

        book = db.query(Book).filter(Book.id == loan_in.book_id).with_for_update().first()
        if not book or book.available_copies < 1:
            raise HTTPException(status_code=400, detail="Out of stock")

        book.available_copies -= 1
        
        new_loan = Loan(
            member_id=loan_in.member_id,
            book_id=loan_in.book_id,
            due_date=date.today() + timedelta(days=loan_in.days or LoanLimits.LOAN_DURATION_DAYS),
            status=LoanStatus.ACTIVE
        )
        db.add(new_loan)
        db.commit()
        db.refresh(new_loan)
        return new_loan

    except Exception as e:
        db.rollback()
        raise e
@router.post("/return/{loan_id}", response_model=LoanResponse)
def return_book(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(Loan).options(joinedload(Loan.book)).filter(Loan.id == loan_id).first()
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan.status == LoanStatus.RETURNED:
        raise HTTPException(status_code=400, detail="This loan is already returned")

    try:
        today = date.today()
        loan.return_date = today
        loan.status = LoanStatus.RETURNED
        
        if today > loan.due_date:
            overdue_days = (today - loan.due_date).days
            fine_amount = overdue_days * FineRates.FINE_PER_DAY
            new_fine = Fine(loan_id=loan.id, amount=fine_amount, status=FineStatus.PENDING)
            db.add(new_fine)
            
        if loan.book:
            if loan.book.available_copies < loan.book.total_copies:
                loan.book.available_copies += 1
            else:
                pass 
        
        db.commit()
        db.refresh(loan)
        return loan

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

@router.get("/", response_model=List[LoanResponse])
def read_loans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    loans = db.query(Loan).options(
        joinedload(Loan.book), 
        joinedload(Loan.member),
        joinedload(Loan.fines)
    ).order_by(Loan.id.desc()).offset(skip).limit(limit).all()
    return loans

@router.get("/check-access")
def check_loan_access(book_id: int, member_id: int, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(
        Loan.book_id == book_id,
        Loan.member_id == member_id,
        Loan.status == LoanStatus.ACTIVE
    ).first()
    return {"has_access": loan is not None}