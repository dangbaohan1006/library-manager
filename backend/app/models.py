from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class BookStatus(str, enum.Enum):
    AVAILABLE = "available"
    OUT_OF_STOCK = "out_of_stock"

class LoanStatus(str, enum.Enum):
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"

class FineStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    joined_date = Column(Date, server_default=func.current_date())

    loans = relationship("Loan", back_populates="member")
    reservations = relationship("Reservation", back_populates="member")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, index=True, nullable=False)
    edition = Column(String, nullable=True)
    publication_year = Column(Integer, nullable=True)
    isbn = Column(String, unique=True, index=True, nullable=False)
    total_copies = Column(Integer, default=1, nullable=False)
    available_copies = Column(Integer, default=1, nullable=False)
    
    file_path = Column(String, nullable=True)
    image_path = Column(String, nullable=True)

    __table_args__ = (
        CheckConstraint('available_copies >= 0', name='check_available_copies_positive'),
        CheckConstraint('total_copies >= 0', name='check_total_copies_positive'),
    )

    loans = relationship("Loan", back_populates="book")
    reservations = relationship("Reservation", back_populates="book", cascade="all, delete-orphan")

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="SET NULL"), nullable=True)
    loan_date = Column(Date, server_default=func.current_date(), nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    status = Column(String, default=LoanStatus.ACTIVE, nullable=False)

    __table_args__ = (
        CheckConstraint('due_date >= loan_date', name='check_due_date_valid'),
    )

    member = relationship("Member", back_populates="loans")
    book = relationship("Book", back_populates="loans")
    fines = relationship("Fine", back_populates="loan")

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    reservation_date = Column(Date, server_default=func.current_date())
    status = Column(String, default="pending")

    member = relationship("Member", back_populates="reservations")
    book = relationship("Book", back_populates="reservations")

class Fine(Base):
    __tablename__ = "fines"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default=FineStatus.PENDING, nullable=False)

    loan = relationship("Loan", back_populates="fines")