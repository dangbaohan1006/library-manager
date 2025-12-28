from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc
import uuid
import boto3
from botocore.exceptions import ClientError

from app.db.database import get_db
from app.models import Book, Loan, LoanStatus, Reservation
from app.schemas import BookResponse, BookCreate, BookUpdate
from app.core.config import settings

router = APIRouter(
    prefix="/books",
    tags=["Books"],
    responses={404: {"description": "Not found"}},
)

def get_s3_client():
    """Initialize and return S3 client"""
    if not all([settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, settings.AWS_REGION, settings.S3_BUCKET_NAME]):
        raise HTTPException(
            status_code=500, 
            detail="S3 configuration is missing. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and S3_BUCKET_NAME"
        )
    
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

@router.post("/upload-image", status_code=status.HTTP_200_OK)
async def upload_book_image(file: UploadFile = File(...)):
    """Upload book cover image to S3 and return the URL"""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"books/{uuid.uuid4()}.{file_ext}"
    
    try:
        s3_client = get_s3_client()
        
        # Read file content
        file_content = await file.read()
        
        # Upload to S3
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=unique_filename,
            Body=file_content,
            ContentType=file.content_type,
            ACL='public-read'  # Make the file publicly accessible
        )
        
        # Generate public URL
        image_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"
        
        return {"image_path": image_url}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error uploading to S3: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@router.get("/", response_model=List[BookResponse])
def read_books(
    skip: int = 0, 
    limit: int = 100, 
    q: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    title: Optional[str] = None,
    author: Optional[str] = None,
    isbn: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    
    # Text search filter
    if q:
        search = f"%{q}%" 
        query = query.filter(
            or_(
                Book.title.ilike(search),
                Book.author.ilike(search),
                Book.isbn.ilike(search)
            )
        )
    
    # Column-specific filters
    if title:
        query = query.filter(Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(Book.author.ilike(f"%{author}%"))
    if isbn:
        query = query.filter(Book.isbn.ilike(f"%{isbn}%"))
    
    # Sorting
    if sort_by:
        sort_column = None
        if sort_by == "title":
            sort_column = Book.title
        elif sort_by == "author":
            sort_column = Book.author
        elif sort_by == "isbn":
            sort_column = Book.isbn
        elif sort_by == "publication_year":
            sort_column = Book.publication_year
        elif sort_by == "total_copies":
            sort_column = Book.total_copies
        elif sort_by == "available_copies":
            sort_column = Book.available_copies
        
        if sort_column:
            if sort_order == "asc":
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(Book.id.desc())
    else:
        query = query.order_by(Book.id.desc())
    
    return query.offset(skip).limit(limit).all()

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
        image_path=book_in.image_path,
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
    if book_update.image_path is not None:
        book.image_path = book_update.image_path
    
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