from app.models import Book, Member, Loan

def test_borrowing_unavailable_book(client):
    """Test borrowing an unavailable book fails"""
    book_res = client.post("/books/", json={
        "title": "Unavailable Book", "author": "Test Author", "isbn": "978-0123460000", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "edge1@example.com", "full_name": "Edge Member", "phone": "111"
    })
    member_id = member_res.json()["id"]
    
    # Borrow the only copy
    borrow1 = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 14
    })
    assert borrow1.status_code == 200
    
    # Try to borrow again (should fail - out of stock)
    borrow2 = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 14
    })
    assert borrow2.status_code == 400
    assert "Out of stock" in borrow2.json()["detail"]

def test_returning_already_returned_book(client):
    """Test returning an already returned book fails"""
    book_res = client.post("/books/", json={
        "title": "Returned Book", "author": "Test Author", "isbn": "978-0123460001", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "edge2@example.com", "full_name": "Edge Member 2", "phone": "222"
    })
    member_id = member_res.json()["id"]
    
    # Borrow and return
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 14
    })
    loan_id = borrow_res.json()["id"]
    
    return1 = client.post(f"/loans/return/{loan_id}")
    assert return1.status_code == 200
    
    # Try to return again (should fail)
    return2 = client.post(f"/loans/return/{loan_id}")
    assert return2.status_code == 400
    assert "already returned" in return2.json()["detail"]

def test_invalid_member_id(client):
    """Test borrowing with invalid member ID fails"""
    book_res = client.post("/books/", json={
        "title": "Test Book", "author": "Test Author", "isbn": "978-0123460002", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    # Try to borrow with non-existent member
    borrow_res = client.post("/loans/borrow", json={
        "member_id": 99999, "book_id": book_id, "days": 14
    })
    assert borrow_res.status_code == 400
    assert "Member invalid" in borrow_res.json()["detail"]

def test_invalid_book_id(client):
    """Test borrowing with invalid book ID fails"""
    member_res = client.post("/members/", json={
        "email": "edge3@example.com", "full_name": "Edge Member 3", "phone": "333"
    })
    member_id = member_res.json()["id"]
    
    # Try to borrow non-existent book
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": 99999, "days": 14
    })
    assert borrow_res.status_code == 400
    assert "Out of stock" in borrow_res.json()["detail"] or "Book not found" in borrow_res.json()["detail"]

