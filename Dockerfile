FROM php:8.2-cli-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache \
        bash \
        build-base \
        postgresql-dev \
        libpq-dev \
        unzip \
        curl \
        icu-dev \
        autoconf \
    && docker-php-ext-install pdo pdo_pgsql \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && rm -rf /var/cache/apk/* /tmp/pear

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY ./php /var/www/html

# Install ALL composer dependencies including mongodb/mongodb
RUN composer install --no-interaction --no-progress --optimize-autoloader

EXPOSE 8000