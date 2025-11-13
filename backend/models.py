from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    borrowed_count = Column(Integer, default=0)

    loans = relationship("Loan", back_populates="book")
    reservations = relationship("Reservation", back_populates="book")


class Member(Base):
    __tablename__ = "members"

    member_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    join_date = Column(Date, default=datetime.now().date)

    loans = relationship("Loan", back_populates="member")
    reservations = relationship("Reservation", back_populates="member")


class Loan(Base):
    __tablename__ = "loans"

    loan_id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.book_id"))
    member_id = Column(Integer, ForeignKey("members.member_id"))
    loan_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    fine_amount = Column(Float, default=0.0)

    book = relationship("Book", back_populates="loans")
    member = relationship("Member", back_populates="loans")


class Reservation(Base):
    __tablename__ = "reservations"

    res_id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.book_id"))
    member_id = Column(Integer, ForeignKey("members.member_id"))
    res_date = Column(Date, nullable=False)

    book = relationship("Book", back_populates="reservations")
    member = relationship("Member", back_populates="reservations")

