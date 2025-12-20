from app.models import Book, Member, Loan

def test_create_book(client):
    response = client.post(
        "/books/",
        json={
            "title": "Test Driven Development",
            "author": "Kent Beck",
            "isbn": "978-0321146533",
            "total_copies": 5,
            "available_copies": 5
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Driven Development"
    assert data["id"] is not None

def test_create_member(client):
    response = client.post(
        "/members/",
        json={
            "email": "tester@example.com",
            "full_name": "Test User",
            "phone": "0123456789"
        },
    )
    assert response.status_code == 201
    assert response.json()["email"] == "tester@example.com"

def test_borrow_book_flow(client):
    book_res = client.post("/books/", json={
        "title": "Clean Code", "author": "Uncle Bob", "isbn": "978-0132350884", "total_copies": 1
    })
    book_id = book_res.json()["id"]

    member_res = client.post("/members/", json={
        "email": "borrower@example.com", "full_name": "Borrower", "phone": "111"
    })
    member_id = member_res.json()["id"]

    borrow_res = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 7
    })
    assert borrow_res.status_code == 200
    assert borrow_res.json()["status"] == "active"

    check_book = client.get(f"/books/{book_id}")
    assert check_book.json()["available_copies"] == 0

    fail_borrow = client.post("/loans/borrow", json={
        "member_id": member_id, "book_id": book_id, "days": 7
    })
    assert fail_borrow.status_code == 400
    assert "Out of stock" in fail_borrow.json()["detail"]