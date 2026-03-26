# Use official PHP with CLI (no Apache, no Nginx needed)
FROM php:8.2-cli-alpine

# Install PostgreSQL driver for PHP
RUN apk add --no-cache postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Set working directory inside container
WORKDIR /var/www/html

# Copy project files into container
COPY ./php /var/www/html

# Expose PHP built-in server port
EXPOSE 8000