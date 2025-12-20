from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models import Book, Loan, LoanStatus, Reservation
from app.schemas import BookResponse, BookCreate, BookUpdate

router = APIRouter(
    prefix="/books",
    tags=["Books"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[BookResponse])
def read_books(
    skip: int = 0, 
    limit: int = 100, 
    q: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if q:
        search = f"%{q}%" 
        query = query.filter(
            or_(
                Book.title.ilike(search),
                Book.author.ilike(search),
                Book.isbn.ilike(search)
            )
        )
    return query.order_by(Book.id.desc()).offset(skip).limit(limit).all()

@router.get("/{book_id}", response_model=BookResponse)
def read_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate, 
    db: Session = Depends(get_db)
):
    clean_isbn = book_in.isbn.replace("-", "").replace(" ", "")
    if len(clean_isbn) not in [10, 13]:
         raise HTTPException(status_code=400, detail="ISBN phải là 10 hoặc 13 số")

    if db.query(Book).filter(Book.isbn == clean_isbn).first():
        raise HTTPException(
            status_code=400, 
            detail=f"Sách với ISBN {clean_isbn} đã tồn tại!"
        )


    new_book = Book(
        title=book_in.title,
        author=book_in.author,
        isbn=clean_isbn,
        total_copies=book_in.total_copies,
        available_copies=book_in.total_copies,
        edition=book_in.edition,
        publication_year=book_in.publication_year,
    )
    
    try:
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        return new_book
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi Database: {str(e)}")

@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    book_update: BookCreate, 
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).with_for_update().first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book_update.total_copies != book.total_copies:
        diff = book_update.total_copies - book.total_copies
        if book.available_copies + diff < 0:
             raise HTTPException(
                 status_code=400, 
                 detail=f"Không thể giảm tổng số lượng xuống {book_update.total_copies} vì đang có sách cho mượn!"
             )
        book.available_copies += diff
        book.total_copies = book_update.total_copies

    book.title = book_update.title
    book.author = book_update.author
    book.edition = book_update.edition
    book.publication_year = book_update.publication_year
    
    clean_isbn = book_update.isbn.replace("-", "").replace(" ", "")
    if clean_isbn != book.isbn:
        existing = db.query(Book).filter(Book.isbn == clean_isbn).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"ISBN {clean_isbn} đã thuộc về sách khác")
            
        book.isbn = clean_isbn

    try:
        db.commit()
        db.refresh(book)
        return book
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).with_for_update().first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    active_loans = db.query(Loan).filter(
        Loan.book_id == book_id, 
        Loan.status == LoanStatus.ACTIVE
    ).count()
    
    if active_loans > 0:
        raise HTTPException(
            status_code=400, 
            detail="Không thể xóa: Sách đang được mượn!"
        )

    pending_reservations = db.query(Reservation).filter(
        Reservation.book_id == book_id,
        Reservation.status == "pending"
    ).count()

    if pending_reservations > 0:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa: Sách đang được đặt trước (Reservation)!"
        )

    try:
        db.delete(book)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))