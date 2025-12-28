from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, or_
from datetime import timedelta, date
from typing import List, Optional

from app.db.database import get_db
from app.models import Loan, Book, Member, Fine, LoanStatus, FineStatus, Reservation
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
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Check if book has available copies
        if book.available_copies < 1:
            raise HTTPException(status_code=400, detail="Out of stock")
        
        # If borrowing from reservation, check if there are enough copies
        # considering other pending reservations for the same book
        if loan_in.reservation_id:
            pending_reservations_count = db.query(Reservation).filter(
                Reservation.book_id == loan_in.book_id,
                Reservation.status == 'pending',
                Reservation.id != loan_in.reservation_id
            ).count()
            
            # Need at least 1 copy available after considering other pending reservations
            if book.available_copies <= pending_reservations_count:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Not enough copies available. There are {pending_reservations_count} other pending reservations for this book."
                )

        book.available_copies -= 1
        
        # Update reservation status if reservation_id is provided
        if loan_in.reservation_id:
            reservation = db.query(Reservation).filter(Reservation.id == loan_in.reservation_id).first()
            if reservation:
                # Verify reservation matches the loan
                if reservation.book_id == loan_in.book_id and reservation.member_id == loan_in.member_id:
                    reservation.status = "approved"
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail="Reservation does not match the loan details"
                    )
        
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
    loan = db.query(Loan).options(
        joinedload(Loan.book),
        joinedload(Loan.fines)
    ).filter(Loan.id == loan_id).first()
    
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
def read_loans(
    skip: int = 0, 
    limit: int = 100,
    q: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Loan).options(
        joinedload(Loan.book), 
        joinedload(Loan.member),
        joinedload(Loan.fines)
    )
    
    # Text search filter
    if q:
        search = f"%{q}%"
        query = query.join(Book).join(Member).filter(
            or_(
                Book.title.ilike(search),
                Member.full_name.ilike(search),
                Member.email.ilike(search)
            )
        )
    
    # Status filter
    if status:
        query = query.filter(Loan.status == status)
    
    # Sorting
    if sort_by:
        sort_column = None
        if sort_by == "loan_date":
            sort_column = Loan.loan_date
        elif sort_by == "due_date":
            sort_column = Loan.due_date
        elif sort_by == "return_date":
            sort_column = Loan.return_date
        elif sort_by == "status":
            sort_column = Loan.status
        
        if sort_column:
            if sort_order == "asc":
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(Loan.id.desc())
    else:
        query = query.order_by(Loan.id.desc())
    
    return query.offset(skip).limit(limit).all()

@router.get("/check-access")
def check_loan_access(book_id: int, member_id: int, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(
        Loan.book_id == book_id,
        Loan.member_id == member_id,
        Loan.status == LoanStatus.ACTIVE
    ).first()
    return {"has_access": loan is not None}

@router.post("/fines/{fine_id}/pay", response_model=LoanResponse)
def pay_fine(fine_id: int, db: Session = Depends(get_db)):
    """Mark a fine as paid"""
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")
    
    if fine.status == FineStatus.PAID:
        raise HTTPException(status_code=400, detail="Fine is already paid")
    
    try:
        fine.status = FineStatus.PAID
        db.commit()
        db.refresh(fine)
        
        # Return the loan with updated fine status
        loan = db.query(Loan).options(
            joinedload(Loan.book),
            joinedload(Loan.member),
            joinedload(Loan.fines)
        ).filter(Loan.id == fine.loan_id).first()
        
        return loan
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update fine: {str(e)}")