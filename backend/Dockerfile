# Multi-stage build for FastAPI backend
# Build for linux/amd64 platform for EC2 compatibility
FROM --platform=linux/amd64 python:3.13-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project file
COPY pyproject.toml ./

# Install dependencies using pip (supports PEP 621 format)
# Extract and install dependencies from pyproject.toml
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir \
        "fastapi>=0.121.2,<0.122.0" \
        "uvicorn[standard]>=0.38.0,<0.39.0" \
        "sqlalchemy>=2.0.44,<3.0.0" \
        "psycopg2-binary>=2.9.11,<3.0.0" \
        "alembic>=1.17.2,<2.0.0" \
        "pydantic>=2.12.4,<3.0.0" \
        "pydantic-settings>=2.12.0,<3.0.0" \
        "python-multipart>=0.0.20,<0.0.21" \
        "python-dotenv>=1.0.0" \
        "supabase>=2.0.0"

# Production stage
FROM --platform=linux/amd64 python:3.13-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/uploaded_books && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health/db || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]

