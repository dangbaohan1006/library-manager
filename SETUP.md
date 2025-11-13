# 🚀 Library Manager - Setup Guide

Complete setup instructions for the Library Manager full-stack application.

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Python 3.8+** installed (`python3 --version`)
- ✅ **Node.js 16+** installed (`node --version`)
- ✅ **Yarn** package manager (`yarn --version`)

If not installed:
```bash
# Install Python from python.org
# Install Node.js from nodejs.org
# Install Yarn
npm install -g yarn
```

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment
```bash
python3 -m venv venv
```

### Step 3: Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Run the Backend Server
```bash
uvicorn main:app --reload
```

✅ **Backend is now running at:** http://localhost:8000
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### Quick Start Script (Alternative)

**macOS/Linux:**
```bash
chmod +x run.sh
./run.sh
```

**Windows:**
```bash
run.bat
```

---

## 🎨 Frontend Setup

### Step 1: Open New Terminal

Keep the backend running, and open a new terminal window.

### Step 2: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 3: Install Dependencies
```bash
yarn
```

This will install all required packages (React, Vite, TailwindCSS, Shadcn/UI, etc.)

### Step 4: Run Development Server
```bash
yarn dev
```

✅ **Frontend is now running at:** http://localhost:5173

---

## 🎯 Verify Everything Works

1. **Open your browser** to http://localhost:5173

2. **You should see:**
   - Navigation bar with Books, Members, Loans, Analytics
   - Books page with 10 sample books
   - Search functionality

3. **Test the features:**
   - ✅ Add a new book
   - ✅ Edit an existing book
   - ✅ Search for books
   - ✅ Navigate to Members page
   - ✅ Try borrowing a book in Loans page
   - ✅ Check Analytics page for statistics

---

## 📊 Database

The application uses **SQLite** by default. The database file `library.db` will be created automatically in the `backend/` directory on first run.

### Mock Data

The following mock data is automatically seeded:

**Books (10):**
- Clean Code by Robert C. Martin
- The Pragmatic Programmer by Andrew Hunt
- Design Patterns by Gang of Four
- Python Crash Course by Eric Matthes
- JavaScript: The Good Parts by Douglas Crockford
- And 5 more...

**Members (5):**
- Nguyễn Văn A (nguyenvana@example.com)
- Trần Thị B (tranthib@example.com)
- Lê Văn C (levanc@example.com)
- Phạm Thị D (phamthid@example.com)
- Hoàng Văn E (hoangvane@example.com)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `command not found: python3`
```bash
# Try using 'python' instead
python -m venv venv
```

**Problem:** `Module not found`
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Problem:** `Port 8000 already in use`
```bash
# Run on different port
uvicorn main:app --reload --port 8001

# Update frontend API URL in src/api/client.ts
```

### Frontend Issues

**Problem:** `yarn: command not found`
```bash
# Install yarn globally
npm install -g yarn
```

**Problem:** `Port 5173 already in use`
```bash
# Vite will automatically use the next available port (5174, 5175, etc.)
# Or specify a port:
yarn dev --port 3000
```

**Problem:** `Cannot connect to API`
```bash
# Make sure backend is running on http://localhost:8000
# Check CORS settings in backend/main.py
# Check API_BASE_URL in frontend/src/api/client.ts
```

---

## 📁 Project Structure

```
library-manager/
├── README.md           # Main documentation
├── SETUP.md           # This file
├── .gitignore         # Git ignore rules
│
├── backend/           # FastAPI Backend
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── constants.py
│   ├── routers/
│   ├── requirements.txt
│   ├── run.sh         # Linux/Mac runner
│   ├── run.bat        # Windows runner
│   └── README.md
│
└── frontend/          # React Frontend
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── lib/
    │   └── App.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── README.md
```

---

## 🎨 Features to Test

### 1. Books Management
- ➕ Add new book
- ✏️ Edit book details
- 🗑️ Delete book
- 🔍 Search books by title/author

### 2. Members Management
- ➕ Add new member
- ✏️ Edit member info
- 🗑️ Delete member
- 🔍 Search members

### 3. Loan System
- 📚 Borrow book (max 5 per member)
- 🔄 Return book
- 💰 Automatic fine calculation for overdue
- ⏰ 14-day loan period

### 4. Analytics
- 📊 Top 10 most borrowed books
- ⚠️ Overdue loans with fines
- 📈 Statistics dashboard

---

## 🎯 Business Rules

1. **Loan Limit:** Max 5 books per member
2. **Loan Duration:** 14 days
3. **Fine Rate:** 1000đ per day for overdue books
4. **Book Availability:** Can't borrow if no copies available

---

## 🔄 Development Workflow

### Backend Development

```bash
cd backend
source venv/bin/activate  # Activate venv
uvicorn main:app --reload  # Auto-reload on changes
```

### Frontend Development

```bash
cd frontend
yarn dev  # Hot reload enabled
```

### Adding New Features

1. **Backend:** Add endpoint in `routers/`
2. **Frontend:** Add service in `src/api/services.ts`
3. **Frontend:** Update page components
4. **Test:** Use API docs at /docs

---

## 📚 Next Steps

After setup, you can:

1. 📖 Read the full [README.md](README.md)
2. 🔌 Explore API at http://localhost:8000/docs
3. 💻 Start coding your features
4. 🎨 Customize the UI theme in `tailwind.config.js`
5. 🔧 Modify business rules in `backend/constants.py`

---

## 💡 Tips

- Keep both terminal windows open (backend + frontend)
- Check browser console for frontend errors
- Check terminal for backend errors
- Use API docs at `/docs` for testing backend
- Frontend uses TypeScript for type safety
- Backend uses Pydantic for validation

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can see books list in browser
- [ ] Can add/edit/delete books
- [ ] Can create members
- [ ] Can borrow and return books
- [ ] Can see analytics
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

**🎉 You're all set! Happy coding!**

If you encounter any issues, check the Troubleshooting section above.

