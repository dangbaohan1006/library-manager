# Library Manager - Backend

FastAPI backend application for library management.

## 🚀 Quick Start

### Using the run script (Recommended)

**macOS/Linux:**
```bash
chmod +x run.sh
./run.sh
```

**Windows:**
```bash
run.bat
```

### Manual setup

1. Create virtual environment:
```bash
python3 -m venv venv
```

2. Activate virtual environment:
```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📂 Project Structure

```
backend/
├── main.py              # FastAPI application
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── constants.py         # Constants (no hardcoding!)
├── routers/
│   ├── books.py        # Books endpoints
│   ├── members.py      # Members endpoints
│   ├── loans.py        # Loans endpoints
│   ├── reservations.py # Reservations endpoints
│   └── analytics.py    # Analytics endpoints
└── requirements.txt     # Dependencies
```

## 🔧 Configuration

### Database

Default: SQLite (file: `library.db`)

To change database, edit `database.py`:

```python
SQLALCHEMY_DATABASE_URL = "sqlite:///./library.db"
# Or use PostgreSQL:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"
```

### CORS

Edit allowed origins in `main.py`:

```python
allow_origins=["http://localhost:5173"]
```

### Constants

Edit business logic constants in `constants.py`:

```python
class LoanLimits(IntEnum):
    MAX_BOOKS_PER_MEMBER = 5
    LOAN_DURATION_DAYS = 14

class FineRates(IntEnum):
    FINE_PER_DAY = 1000
```

## 📊 Mock Data

The application automatically seeds the database with mock data on first startup:
- 10 sample books
- 5 sample members

## 🔌 API Endpoints

### Books
- `GET /books` - List all books
- `GET /books/{id}` - Get book details
- `POST /books` - Create book
- `PUT /books/{id}` - Update book
- `DELETE /books/{id}` - Delete book

### Members
- `GET /members` - List all members
- `GET /members/{id}` - Get member details
- `POST /members` - Create member
- `PUT /members/{id}` - Update member
- `DELETE /members/{id}` - Delete member

### Loans
- `GET /loans` - List all loans
- `GET /loans/active` - List active loans
- `POST /loans/borrow` - Borrow a book
- `POST /loans/return` - Return a book

### Reservations
- `GET /reservations` - List all reservations
- `POST /reservations/reserve` - Reserve a book
- `DELETE /reservations/{id}` - Delete reservation

### Analytics
- `GET /analytics/top-books?limit=10` - Top borrowed books
- `GET /analytics/overdue-loans` - Overdue loans with fines

## 🎯 Business Rules

1. **Max 5 books** per member at a time
2. **14-day loan** period
3. **1000đ per day** fine for overdue books
4. **Automatic validation** of all business rules
5. **No hardcoded values** - all constants in `constants.py`

## 🛠️ Technologies

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **SQLite** - Database (default)

## 🧪 Testing

To test the API, you can:
1. Use the interactive docs at `/docs`
2. Use curl or Postman
3. Use the frontend application

Example curl command:
```bash
# Get all books
curl http://localhost:8000/books

# Create a book
curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"New Book","author":"Author Name","quantity":5}'
```

## 📝 Notes

- Database file (`library.db`) is created automatically
- All validation errors return appropriate HTTP status codes
- CORS is configured for frontend development

