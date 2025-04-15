#!/bin/bash
DOMAIN="sovpadem.site"

echo "Останавливаем nginx для освобождения 80 порта..."
docker compose stop nginx

echo "Запуск certbot в режиме standalone..."
docker compose run --rm certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email admin@sovpadem.site \
  -d $DOMAIN

echo "Запускаем nginx снова..."
docker compose up -d nginx

echo "Готово!" 