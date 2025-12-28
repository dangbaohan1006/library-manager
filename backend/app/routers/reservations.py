from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, or_
from typing import List, Optional
from datetime import date

from app.db.database import get_db
from app.models import Reservation, Book, Member
from app.schemas import ReservationCreate, ReservationResponse

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("/reserve", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def reserve_book(reservation: ReservationCreate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == reservation.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    member = db.query(Member).filter(Member.id == reservation.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    existing_reservation = db.query(Reservation).filter(
        Reservation.book_id == reservation.book_id,
        Reservation.member_id == reservation.member_id,
        Reservation.status == 'pending'
    ).first()
    
    if existing_reservation:
        raise HTTPException(status_code=400, detail="Member already has a pending reservation for this book")
    
    new_reservation = Reservation(
        book_id=reservation.book_id,
        member_id=reservation.member_id,
        reservation_date=reservation.reservation_date if reservation.reservation_date else date.today(),
        status="pending"
    )
    
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    
    return new_reservation

@router.get("/", response_model=List[ReservationResponse])
def get_reservations(
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Reservation).options(
        joinedload(Reservation.book),
        joinedload(Reservation.member)
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
        query = query.filter(Reservation.status == status)
    
    # Sorting
    if sort_by:
        sort_column = None
        if sort_by == "reservation_date":
            sort_column = Reservation.reservation_date
        elif sort_by == "status":
            sort_column = Reservation.status
        
        if sort_column:
            if sort_order == "asc":
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(Reservation.id.desc())
    else:
        query = query.order_by(Reservation.id.desc())
    
    return query.offset(skip).limit(limit).all()

@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    db.delete(reservation)
    db.commit()
    return