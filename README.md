# 📚 Library Manager - Full Stack Application

A modern library management system built with **FastAPI** (Backend) and **React + Vite + TypeScript + Shadcn/UI** (Frontend).

## ✨ Features

- 📖 **Books Management** - CRUD operations for library books
- 👥 **Members Management** - Manage library members
- 🔄 **Loan System** - Borrow and return books with automatic fine calculation
- 📊 **Analytics** - Top borrowed books and overdue loans tracking
- ⚡ **Real-time Validation** - Check loan limits (max 5 books per member)
- 💰 **Fine Calculation** - Automatic fine of 1000đ per day for overdue books

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (can be switched to PostgreSQL)
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Shadcn/UI** - Beautiful UI components
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
library-manager/
├── backend/
│   ├── main.py              # FastAPI application entry
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── constants.py         # Constants and enums
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── books.py         # Books endpoints
│   │   ├── members.py       # Members endpoints
│   │   ├── loans.py         # Loans endpoints
│   │   ├── reservations.py  # Reservations endpoints
│   │   └── analytics.py     # Analytics endpoints
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts    # Axios configuration
    │   │   ├── services.ts  # API services
    │   │   └── types.ts     # TypeScript types
    │   ├── components/
    │   │   ├── ui/          # Shadcn/UI components
    │   │   └── Layout.tsx   # Main layout
    │   ├── pages/
    │   │   ├── BooksPage.tsx
    │   │   ├── MembersPage.tsx
    │   │   ├── LoansPage.tsx
    │   │   └── AnalyticsPage.tsx
    │   ├── lib/
    │   │   └── utils.ts     # Utility functions
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn
```

3. Run the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## 📊 Database Schema

### Tables

**books**
- `book_id` (PK)
- `title`
- `author`
- `quantity`
- `borrowed_count`

**members**
- `member_id` (PK)
- `name`
- `email`
- `join_date`

**loans**
- `loan_id` (PK)
- `book_id` (FK)
- `member_id` (FK)
- `loan_date`
- `due_date`
- `return_date` (nullable)
- `fine_amount`

**reservations**
- `res_id` (PK)
- `book_id` (FK)
- `member_id` (FK)
- `res_date`

## 🔌 API Endpoints

### Books
- `GET /books` - Get all books
- `GET /books/{id}` - Get book by ID
- `POST /books` - Create new book
- `PUT /books/{id}` - Update book
- `DELETE /books/{id}` - Delete book

### Members
- `GET /members` - Get all members
- `GET /members/{id}` - Get member by ID
- `POST /members` - Create new member
- `PUT /members/{id}` - Update member
- `DELETE /members/{id}` - Delete member

### Loans
- `GET /loans` - Get all loans
- `GET /loans/active` - Get active loans
- `POST /loans/borrow` - Borrow a book
- `POST /loans/return` - Return a book

### Reservations
- `GET /reservations` - Get all reservations
- `POST /reservations/reserve` - Reserve a book
- `DELETE /reservations/{id}` - Delete reservation

### Analytics
- `GET /analytics/top-books?limit=10` - Get top borrowed books
- `GET /analytics/overdue-loans` - Get overdue loans

## 🎯 Business Rules

1. **Loan Limit**: Each member can borrow maximum 5 books at a time
2. **Loan Duration**: 14 days from borrow date
3. **Fine Calculation**: 1000đ per day for overdue books
4. **Book Availability**: Books can only be borrowed if available quantity > 0
5. **Reservation**: Members can reserve books that are currently borrowed

## 🧪 Mock Data

The backend automatically seeds the database with mock data on first run:
- 10 sample books
- 5 sample members

## 🎨 UI Features

- **Responsive Design** - Works on all screen sizes
- **Search & Filter** - Easy to find books and members
- **Real-time Validation** - Form validation and error handling
- **Toast Notifications** - User feedback for all actions
- **Loading States** - Loading indicators for better UX
- **Confirmation Dialogs** - Prevent accidental deletions

## 🔧 Configuration

### Backend Configuration
- Database URL: Edit `SQLALCHEMY_DATABASE_URL` in `backend/database.py`
- CORS origins: Edit `allow_origins` in `backend/main.py`
- Constants: Edit values in `backend/constants.py`

### Frontend Configuration
- API Base URL: Edit `API_BASE_URL` in `frontend/src/api/client.ts`
- TailwindCSS theme: Edit `frontend/tailwind.config.js`

## 📝 Notes

- The application uses SQLite by default. To use PostgreSQL, update the database URL in `database.py`
- Mock data is seeded automatically on first run
- The fine calculation happens automatically when returning a book past its due date
- All dates are handled in ISO format for consistency

## 🚧 Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications for due dates
- [ ] Book categories and tags
- [ ] Advanced search and filters
- [ ] Export reports to PDF/Excel
- [ ] Dark mode toggle
- [ ] Multi-language support

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using FastAPI and React


library-manager
├─ .pytest_cache
│  ├─ CACHEDIR.TAG
│  ├─ README.md
│  └─ v
│     └─ cache
│        ├─ lastfailed
│        └─ nodeids
├─ backend
│  ├─ .pytest_cache
│  │  ├─ CACHEDIR.TAG
│  │  ├─ README.md
│  │  └─ v
│  │     └─ cache
│  │        └─ nodeids
│  ├─ alembic
│  │  ├─ env.py
│  │  ├─ README
│  │  ├─ script.py.mako
│  │  └─ versions
│  │     └─ e504c475f527_init_db.py
│  ├─ alembic.ini
│  ├─ app
│  │  ├─ core
│  │  │  ├─ config.py
│  │  │  └─ constants.py
│  │  ├─ db
│  │  │  └─ database.py
│  │  ├─ index.py
│  │  ├─ main.py
│  │  ├─ models.py
│  │  ├─ routers
│  │  │  ├─ analytics.py
│  │  │  ├─ books.py
│  │  │  ├─ loans.py
│  │  │  ├─ members.py
│  │  │  ├─ reservations.py
│  │  │  └─ __init__.py
│  │  ├─ schemas.py
│  │  └─ __init__.py
│  ├─ poetry.lock
│  ├─ pyproject.toml
│  ├─ pytest.ini
│  ├─ tests
│  │  ├─ conftest.py
│  │  └─ test_integration.py
│  ├─ uploaded_books
│  └─ vercel-export.txt
├─ docker-compose.yml
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  ├─ index.css
│  │  ├─ layout
│  │  │  └─ DashboardLayout.jsx
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ BooksPage.jsx
│  │  │  ├─ DashboardPage.jsx
│  │  │  ├─ LoansPage.jsx
│  │  │  └─ MembersPage.jsx
│  │  └─ services
│  │     └─ api.js
│  └─ vite.config.js
├─ package.json
├─ README.md
├─ SETUP.md
└─ vercel.json

```