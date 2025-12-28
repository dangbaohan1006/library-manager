from datetime import date, timedelta
from app.models import Book, Member, Loan, Fine, LoanStatus, FineStatus
from sqlalchemy.orm import Session

def test_fine_calculation_one_day_overdue(client, db_session: Session):
    """Test fine calculation for 1 day overdue"""
    # Create book and member
    book_res = client.post("/books/", json={
        "title": "Test Book", "author": "Test Author", "isbn": "978-0123456789", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "test1@example.com", "full_name": "Test Member 1", "phone": "123"
    })
    member_id = member_res.json()["id"]
    
    # Borrow book
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 7
    })
    loan_id = borrow_res.json()["id"]
    
    # Simulate overdue by manually updating due_date to yesterday
    loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    loan.due_date = date.today() - timedelta(days=1)
    db_session.commit()
    
    # Return book (should calculate fine)
    return_res = client.post(f"/loans/return/{loan_id}")
    assert return_res.status_code == 200
    
    # Check fine was created
    fine = db_session.query(Fine).filter(Fine.loan_id == loan_id).first()
    assert fine is not None
    assert float(fine.amount) == 5000  # 1 day * 5000đ
    assert fine.status == FineStatus.PENDING

def test_fine_calculation_multiple_days_overdue(client, db_session: Session):
    """Test fine calculation for multiple days overdue"""
    book_res = client.post("/books/", json={
        "title": "Test Book 2", "author": "Test Author", "isbn": "978-0123456790", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "test2@example.com", "full_name": "Test Member 2", "phone": "456"
    })
    member_id = member_res.json()["id"]
    
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 7
    })
    loan_id = borrow_res.json()["id"]
    
    # Simulate 5 days overdue
    loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    loan.due_date = date.today() - timedelta(days=5)
    db_session.commit()
    
    return_res = client.post(f"/loans/return/{loan_id}")
    assert return_res.status_code == 200
    
    fine = db_session.query(Fine).filter(Fine.loan_id == loan_id).first()
    assert fine is not None
    assert float(fine.amount) == 25000  # 5 days * 5000đ

def test_no_fine_for_on_time_return(client, db_session: Session):
    """Test no fine for on-time return"""
    book_res = client.post("/books/", json={
        "title": "Test Book 3", "author": "Test Author", "isbn": "978-0123456791", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "test3@example.com", "full_name": "Test Member 3", "phone": "789"
    })
    member_id = member_res.json()["id"]
    
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 14
    })
    loan_id = borrow_res.json()["id"]
    
    # Return on time (due_date is in future)
    return_res = client.post(f"/loans/return/{loan_id}")
    assert return_res.status_code == 200
    
    # Check no fine was created
    fine = db_session.query(Fine).filter(Fine.loan_id == loan_id).first()
    assert fine is None

def test_fine_status_pending(client, db_session: Session):
    """Test fine status is set to pending"""
    book_res = client.post("/books/", json={
        "title": "Test Book 4", "author": "Test Author", "isbn": "978-0123456792", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "test4@example.com", "full_name": "Test Member 4", "phone": "000"
    })
    member_id = member_res.json()["id"]
    
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 7
    })
    loan_id = borrow_res.json()["id"]
    
    # Make overdue
    loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    loan.due_date = date.today() - timedelta(days=3)
    db_session.commit()
    
    return_res = client.post(f"/loans/return/{loan_id}")
    assert return_res.status_code == 200
    
    fine = db_session.query(Fine).filter(Fine.loan_id == loan_id).first()
    assert fine.status == FineStatus.PENDING

