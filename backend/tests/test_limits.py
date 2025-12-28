from app.models import Book, Member, Loan, LoanStatus

def test_borrowing_up_to_limit(client):
    """Test borrowing up to the limit (3 books)"""
    # Create member
    member_res = client.post("/members/", json={
        "email": "limit1@example.com", "full_name": "Limit Member", "phone": "111"
    })
    member_id = member_res.json()["id"]
    
    # Create 3 books
    book_ids = []
    for i in range(3):
        book_res = client.post("/books/", json={
            "title": f"Book {i+1}", "author": "Test Author", "isbn": f"978-0123456{i:03d}", "total_copies": 1
        })
        book_ids.append(book_res.json()["id"])
    
    # Borrow all 3 books (should succeed)
    for book_id in book_ids:
        borrow_res = client.post("/loans/borrow", json={
            "member_id": member_id, "book_id": book_id, "days": 14
        })
        assert borrow_res.status_code == 200
        assert borrow_res.json()["status"] == "active"

def test_exceeding_limit_rejection(client):
    """Test that exceeding limit is rejected"""
    member_res = client.post("/members/", json={
        "email": "limit2@example.com", "full_name": "Limit Member 2", "phone": "222"
    })
    member_id = member_res.json()["id"]
    
    # Create 4 books
    book_ids = []
    for i in range(4):
        book_res = client.post("/books/", json={
            "title": f"Book {i+1}", "author": "Test Author", "isbn": f"978-0123457{i:03d}", "total_copies": 1
        })
        book_ids.append(book_res.json()["id"])
    
    # Borrow first 3 (should succeed)
    for book_id in book_ids[:3]:
        borrow_res = client.post("/loans/borrow", json={
            "member_id": member_id, "book_id": book_id, "days": 14
        })
        assert borrow_res.status_code == 200
    
    # Try to borrow 4th (should fail)
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_ids[3], "days": 14
    })
    assert borrow_res.status_code == 400
    assert "Limit reached" in borrow_res.json()["detail"]

def test_limit_after_return(client):
    """Test that limit is reset after returning a book"""
    member_res = client.post("/members/", json={
        "email": "limit3@example.com", "full_name": "Limit Member 3", "phone": "333"
    })
    member_id = member_res.json()["id"]
    
    # Create 4 books
    book_ids = []
    for i in range(4):
        book_res = client.post("/books/", json={
            "title": f"Book {i+1}", "author": "Test Author", "isbn": f"978-0123458{i:03d}", "total_copies": 1
        })
        book_ids.append(book_res.json()["id"])
    
    # Borrow 3 books
    loan_ids = []
    for book_id in book_ids[:3]:
        borrow_res = client.post("/loans/borrow", json={
            "member_id": member_id, "book_id": book_id, "days": 14
        })
        loan_ids.append(borrow_res.json()["id"])
    
    # Return one book
    return_res = client.post(f"/loans/return/{loan_ids[0]}")
    assert return_res.status_code == 200
    
    # Now should be able to borrow the 4th book
    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_ids[3], "days": 14
    })
    assert borrow_res.status_code == 200

def test_limit_with_multiple_members(client):
    """Test that limit applies per member, not globally"""
    # Create 2 members
    member1_res = client.post("/members/", json={
        "email": "limit4a@example.com", "full_name": "Member A", "phone": "444"
    })
    member1_id = member1_res.json()["id"]
    
    member2_res = client.post("/members/", json={
        "email": "limit4b@example.com", "full_name": "Member B", "phone": "555"
    })
    member2_id = member2_res.json()["id"]
    
    # Create 6 books
    book_ids = []
    for i in range(6):
        book_res = client.post("/books/", json={
            "title": f"Book {i+1}", "author": "Test Author", "isbn": f"978-0123459{i:03d}", "total_copies": 1
        })
        book_ids.append(book_res.json()["id"])
    
    # Member 1 borrows 3 books
    for book_id in book_ids[:3]:
        borrow_res = client.post("/loans/borrow", json={
            "member_id": member1_id, "book_id": book_id, "days": 14
        })
        assert borrow_res.status_code == 200
    
    # Member 2 should also be able to borrow 3 books
    for book_id in book_ids[3:]:
        borrow_res = client.post("/loans/borrow", json={
            "member_id": member2_id, "book_id": book_id, "days": 14
        })
        assert borrow_res.status_code == 200

