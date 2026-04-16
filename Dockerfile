# Use official PHP CLI image (Alpine)
FROM php:8.2-cli-alpine

# Update apk repos and install dependencies for PostgreSQL + PHP extensions
RUN apk update && apk upgrade && \
    apk add --no-cache \
        bash \
        build-base \
        postgresql-dev \
        libpq-dev \
        unzip \
        curl \
        icu-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/cache/apk/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY ./php /var/www/html

# Install PHPMailer via Composer
RUN composer require phpmailer/phpmailer --no-interaction --no-progress

# Expose built-in PHP server port
EXPOSE 8000