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

# Install dependencies automatically from pyproject.toml (PEP 621 format)
# Parse pyproject.toml and install dependencies using Python's tomllib
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python3 <<EOF
import tomllib
import subprocess
import sys

with open('pyproject.toml', 'rb') as f:
    data = tomllib.load(f)

deps = data['project']['dependencies']
subprocess.run([sys.executable, '-m', 'pip', 'install', '--no-cache-dir'] + deps, check=True)
EOF

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

