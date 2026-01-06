# Multi-stage build for Laravel PHP backend
FROM --platform=linux/amd64 php:8.2-fpm AS builder

# Install system dependencies and PHP extensions in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer (use specific version for better caching)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first (for better layer caching)
COPY composer.json composer.lock* ./

# Install dependencies with cache directory
RUN --mount=type=cache,target=/root/.composer/cache \
    composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Production stage
FROM --platform=linux/amd64 php:8.2-fpm

# Install dependencies and PHP extensions (same as builder but without git/zip)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create non-root user and directories in one layer
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/storage /app/bootstrap/cache && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder --chown=appuser:appuser /app/vendor /app/vendor

# Copy composer files for artisan commands
COPY --chown=appuser:appuser composer.json composer.lock* ./

# Copy application code (this should be last to maximize cache hits)
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/db || exit 1

# Run PHP built-in server (similar to uvicorn for Python)
# Use router.php to handle all requests through Laravel
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public", "public/router.php"]

