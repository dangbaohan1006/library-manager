# Library Manager Backend - Laravel PHP

This is the PHP/Laravel version of the Library Manager backend API, migrated from FastAPI (Python).

## Technology Stack

- **Framework:** Laravel 11.x
- **PHP Version:** 8.2
- **Database:** MySQL 8.0+
- **ORM:** Eloquent
- **File Storage:** AWS S3

## Setup

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=library_manager
DB_USERNAME=root
DB_PASSWORD=
```

5. Run migrations:
```bash
php artisan migrate
```

6. Seed sample data (optional):
```bash
php artisan db:seed
```

Or run migrations and seed together:
```bash
php artisan migrate --seed
```

6. Start development server:
```bash
php artisan serve --port=8000
```

Or use the convenience script (clears cache first):
```bash
./run-dev.sh
```

**Note:** For development, simply stopping and restarting `php artisan serve` is enough to run the latest code. PHP is an interpreted language, so no compilation is needed. However, if you encounter issues, you may need to clear caches:
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

## API Endpoints

All endpoints are prefixed with `/api`:

- `GET /api/` - Root endpoint
- `GET /api/health/db` - Database health check
- `GET /api/books` - List books
- `POST /api/books` - Create book
- `GET /api/loans` - List loans
- `POST /api/loans/borrow` - Borrow book
- `POST /api/loans/return/{id}` - Return book
- `GET /api/members` - List members
- `GET /api/reservations` - List reservations
- `GET /api/analytics/dashboard` - Dashboard stats

## Docker

Build and run with Docker:
```bash
docker build -t library-manager-php .
docker run -p 8000:8000 library-manager-php
```

## Testing

Run PHPUnit tests:
```bash
php artisan test
```

