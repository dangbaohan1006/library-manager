from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from enum import Enum


class LoanStatus(str, Enum):
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"


class BookBase(BaseModel):
    title: str
    author: str
    quantity: int


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    quantity: Optional[int] = None


class BookResponse(BookBase):
    book_id: int
    borrowed_count: int

    class Config:
        from_attributes = True


class MemberBase(BaseModel):
    name: str
    email: EmailStr


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class MemberResponse(MemberBase):
    member_id: int
    join_date: date

    class Config:
        from_attributes = True


class LoanBase(BaseModel):
    book_id: int
    member_id: int


class LoanCreate(LoanBase):
    pass


class LoanResponse(LoanBase):
    loan_id: int
    loan_date: date
    due_date: date
    return_date: Optional[date] = None
    fine_amount: float

    class Config:
        from_attributes = True


class ReturnRequest(BaseModel):
    loan_id: int


class ReservationBase(BaseModel):
    book_id: int
    member_id: int


class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    res_id: int
    res_date: date

    class Config:
        from_attributes = True


class TopBookResponse(BaseModel):
    book_id: int
    title: str
    author: str
    borrowed_count: int

    class Config:
        from_attributes = True


class OverdueLoanResponse(BaseModel):
    loan_id: int
    book_title: str
    member_name: str
    due_date: date
    days_overdue: int
    fine_amount: float

    class Config:
        from_attributes = True

