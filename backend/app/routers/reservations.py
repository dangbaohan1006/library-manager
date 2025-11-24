from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
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
        reservation_date=date.today(),
        status="pending"
    )
    
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    
    return new_reservation

@router.get("/", response_model=List[ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    reservations = db.query(Reservation).options(
        joinedload(Reservation.book),
        joinedload(Reservation.member)
    ).all()
    return reservations

@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    db.delete(reservation)
    db.commit()
    return