import os
import uuid
from typing import List, Optional
from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from supabase import create_client, Client

from app.db.database import get_db
from app.models import Book, Loan, LoanStatus
from app.schemas import BookResponse
from app.core.config import settings

router = APIRouter(
    prefix="/books",
    tags=["Books"],
    responses={404: {"description": "Not found"}},
)

# --- CẤU HÌNH SUPABASE TỪ SETTINGS ---
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY
BUCKET_NAME = "library-files"

# Khởi tạo Client an toàn
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase Init Error: {e}")

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

def upload_to_supabase(path: str, file_content: bytes, content_type: str):
    supabase.storage.from_(BUCKET_NAME).upload(
        path=path, 
        file=file_content, 
        file_options={"content-type": content_type}
    )
    return supabase.storage.from_(BUCKET_NAME).get_public_url(path)

@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    title: str = Form(...),
    author: str = Form(...),
    isbn: str = Form(...),
    total_copies: int = Form(1),
    edition: Optional[str] = Form(None),
    publication_year: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    clean_isbn = isbn.replace("-", "").replace(" ", "")
    if db.query(Book).filter(Book.isbn == clean_isbn).first():
        raise HTTPException(status_code=400, detail=f"Sách với ISBN {clean_isbn} đã tồn tại!")

    if (file or cover_image) and not supabase:
        raise HTTPException(status_code=500, detail="Server chưa cấu hình Supabase!")

    # 3. Xử lý Upload PDF (Tối ưu hóa với ThreadPool)
    file_url = None
    if file:
        try:
            # Đọc file vào RAM (Async)
            file_content = await file.read()
            file_ext = file.filename.split(".")[-1]
            file_name = f"pdfs/{uuid.uuid4()}.{file_ext}"
            
            # [OPTIMIZATION] Chạy việc upload nặng trong luồng riêng để không chặn Server
            print(f"Đang upload PDF {len(file_content)/1024/1024:.2f} MB...")
            file_url = await run_in_threadpool(
                upload_to_supabase, 
                path=file_name, 
                file_content=file_content, 
                content_type=file.content_type
            )
            print("Upload PDF xong!")
        except Exception as e:
            print(f"Lỗi upload PDF: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi upload file: {str(e)}")

    # 4. Xử lý Upload Ảnh bìa
    image_url = None
    if cover_image:
        try:
            img_content = await cover_image.read()
            img_ext = cover_image.filename.split(".")[-1]
            img_name = f"covers/{uuid.uuid4()}.{img_ext}"
            
            # [OPTIMIZATION] Chạy upload ảnh trong luồng riêng
            image_url = await run_in_threadpool(
                upload_to_supabase,
                path=img_name,
                file_content=img_content,
                content_type=cover_image.content_type
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi upload ảnh: {str(e)}")
    else:
        image_url = f"https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg"

    new_book = Book(
        title=title, author=author, isbn=clean_isbn, total_copies=total_copies,
        available_copies=total_copies, edition=edition, publication_year=publication_year,
        file_path=file_url, image_path=image_url
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book
    # 5. Lưu vào DB
    new_book = Book(
        title=title,
        author=author,
        isbn=clean_isbn,
        total_copies=total_copies,
        available_copies=total_copies,
        edition=edition,
        publication_year=publication_year,
        file_path=file_url,
        image_path=image_url
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    active_loans = db.query(Loan).filter(
        Loan.book_id == book_id, 
        Loan.status == LoanStatus.ACTIVE
    ).count()
    
    if active_loans > 0:
        raise HTTPException(status_code=400, detail="Không thể xóa sách đang được mượn!")

    db.delete(book)
    db.commit()
    return

@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    # Sử dụng Form(None) để cho phép gửi từng trường lẻ tẻ (Optional)
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    total_copies: Optional[int] = Form(None),
    # Nhận file ảnh mới (Optional)
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Cập nhật thông tin văn bản
    if title: 
        book.title = title
    if author: 
        book.author = author
    if total_copies is not None:
        # Logic thông minh: Nếu tăng/giảm tổng số, cập nhật luôn available
        diff = total_copies - book.total_copies
        book.total_copies = total_copies
        book.available_copies += diff

    # Xử lý Upload Ảnh mới (Nếu người dùng chọn ảnh mới)
    if cover_image and supabase:
        try:
            img_content = await cover_image.read()
            img_ext = cover_image.filename.split(".")[-1]
            img_name = f"covers/{uuid.uuid4()}.{img_ext}"

            # Dùng lại hàm upload_to_supabase đã viết ở trên
            image_url = await run_in_threadpool(
                upload_to_supabase,
                path=img_name,
                file_content=img_content,
                content_type=cover_image.content_type
            )
            # Cập nhật đường dẫn mới vào DB
            book.image_path = image_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi upload ảnh cập nhật: {str(e)}")

    db.commit()
    db.refresh(book)
    return book