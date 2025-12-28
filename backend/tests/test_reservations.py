from app.models import Book, Member, Reservation

def test_create_reservation(client):
    """Test creating a reservation"""
    book_res = client.post("/books/", json={
        "title": "Reserved Book", "author": "Test Author", "isbn": "978-0123456800", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "reserve1@example.com", "full_name": "Reserve Member", "phone": "111"
    })
    member_id = member_res.json()["id"]
    
    reserve_res = client.post("/reservations/reserve", json={
        "member_id": member_id, "book_id": book_id
    })
    
    assert reserve_res.status_code == 201
    data = reserve_res.json()
    assert data["book_id"] == book_id
    assert data["member_id"] == member_id
    assert data["status"] == "pending"

def test_duplicate_reservation_prevention(client):
    """Test that duplicate reservations are prevented"""
    book_res = client.post("/books/", json={
        "title": "Reserved Book 2", "author": "Test Author", "isbn": "978-0123456801", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "reserve2@example.com", "full_name": "Reserve Member 2", "phone": "222"
    })
    member_id = member_res.json()["id"]
    
    # Create first reservation
    reserve1 = client.post("/reservations/reserve", json={
        "member_id": member_id, "book_id": book_id
    })
    assert reserve1.status_code == 201
    
    # Try to create duplicate
    reserve2 = client.post("/reservations/reserve", json={
        "member_id": member_id, "book_id": book_id
    })
    assert reserve2.status_code == 400
    assert "already has a pending reservation" in reserve2.json()["detail"]

def test_cancel_reservation(client):
    """Test canceling a reservation"""
    book_res = client.post("/books/", json={
        "title": "Reserved Book 3", "author": "Test Author", "isbn": "978-0123456802", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "reserve3@example.com", "full_name": "Reserve Member 3", "phone": "333"
    })
    member_id = member_res.json()["id"]
    
    reserve_res = client.post("/reservations/reserve", json={
        "member_id": member_id, "book_id": book_id
    })
    reservation_id = reserve_res.json()["id"]
    
    # Cancel reservation
    cancel_res = client.delete(f"/reservations/{reservation_id}")
    assert cancel_res.status_code == 204
    
    # Verify it's deleted
    get_res = client.get("/reservations/")
    reservations = get_res.json()
    assert not any(r["id"] == reservation_id for r in reservations)

def test_reservation_with_available_book(client):
    """Test reservation can be created even if book is available"""
    book_res = client.post("/books/", json={
        "title": "Available Book", "author": "Test Author", "isbn": "978-0123456803", "total_copies": 5
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "reserve4@example.com", "full_name": "Reserve Member 4", "phone": "444"
    })
    member_id = member_res.json()["id"]
    
    # Book is available, but reservation should still work
    reserve_res = client.post("/reservations/reserve", json={
        "member_id": member_id, "book_id": book_id
    })
    assert reserve_res.status_code == 201

def test_get_all_reservations(client):
    """Test getting all reservations"""
    # Create some reservations
    book_res = client.post("/books/", json={
        "title": "Book for List", "author": "Test Author", "isbn": "978-0123456804", "total_copies": 1
    })
    book_id = book_res.json()["id"]
    
    member_res = client.post("/members/", json={
        "email": "reserve5@example.com", "full_name": "Reserve Member 5", "phone": "555"
    })
    member_id = member_res.json()["id"]
    
    client.post("/reservations/reserve", json={
        "member_id": member_id, "book_id": book_id
    })
    
    # Get all reservations
    get_res = client.get("/reservations/")
    assert get_res.status_code == 200
    reservations = get_res.json()
    assert len(reservations) >= 1
    assert any(r["book_id"] == book_id and r["member_id"] == member_id for r in reservations)

