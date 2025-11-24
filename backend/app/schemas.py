from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date
from decimal import Decimal

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, example="Clean Code")
    author: str = Field(..., min_length=1, example="Robert C. Martin")
    edition: Optional[str] = None
    publication_year: Optional[int] = None
    isbn: str = Field(..., min_length=10, max_length=17, example="978-0132350884")
    total_copies: int = Field(default=1, ge=0)

    @field_validator('isbn')
    @classmethod
    def clean_isbn(cls, v: str) -> str:
        clean_v = v.replace("-", "").replace(" ", "")
        if len(clean_v) not in [10, 13]:
             raise ValueError('ISBN must be 10 or 13 digits')
        return clean_v

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: int
    available_copies: int
    file_path: Optional[str] = None
    image_path: Optional[str] = None 

    class Config:
        from_attributes = True

class MemberBase(BaseModel):
    email: str = Field(..., example="user@example.com")
    full_name: str = Field(..., min_length=1, example="Nguyen Van A")
    phone: Optional[str] = Field(None, example="0901234567")

class MemberCreate(MemberBase):
    pass

class MemberResponse(MemberBase):
    id: int
    is_active: bool
    joined_date: date

    class Config:
        from_attributes = True

class FineResponse(BaseModel):
    id: int
    amount: float
    status: str

    class Config:
        from_attributes = True

class LoanBase(BaseModel):
    member_id: int
    book_id: int

class LoanCreate(LoanBase):
    days: int = Field(14, ge=1, le=14, description="Number of days to borrow")

class LoanResponse(LoanBase):
    id: int
    loan_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    
    book: Optional[BookResponse] = None
    member: Optional[MemberResponse] = None
    fines: List[FineResponse] = []

    class Config:
        from_attributes = True

class ReservationBase(BaseModel):
    member_id: int
    book_id: int

class ReservationCreate(ReservationBase):
    pass

class ReservationResponse(ReservationBase):
    id: int
    reservation_date: date
    status: str
    
    book: Optional[BookResponse] = None
    member: Optional[MemberResponse] = None

    class Config:
        from_attributes = True