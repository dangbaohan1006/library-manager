from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import Reservation, Book, Member
from schemas import ReservationCreate, ReservationResponse

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("/reserve", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def reserve_book(reservation: ReservationCreate, db: Session = Depends(get_db)):
    # Check if book exists
    book = db.query(Book).filter(Book.book_id == reservation.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Check if member exists
    member = db.query(Member).filter(Member.member_id == reservation.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # Check if member already has a reservation for this book
    existing_reservation = db.query(Reservation).filter(
        Reservation.book_id == reservation.book_id,
        Reservation.member_id == reservation.member_id
    ).first()
    
    if existing_reservation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member already has a reservation for this book"
        )
    
    # Create reservation
    db_reservation = Reservation(
        book_id=reservation.book_id,
        member_id=reservation.member_id,
        res_date=datetime.now().date()
    )
    
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    
    return db_reservation


@router.get("", response_model=List[ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    reservations = db.query(Reservation).all()
    return reservations


@router.delete("/{res_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(res_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.res_id == res_id).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    db.delete(reservation)
    db.commit()
    return None

