#!/bin/bash
DOMAIN="sovpadem.site"

echo "Запускаем certbot в режиме standalone с полным логированием..."
docker compose stop nginx

docker compose run -t --rm certbot certonly \
  --standalone \
  --preferred-challenges http \
  --verbose \
  --debug \
  --non-interactive \
  --agree-tos \
  --email admin@sovpadem.site \
  -d $DOMAIN

RESULT=$?
echo "Код завершения: $RESULT"

docker compose up -d nginx

if [ $RESULT -eq 0 ]; then
  echo "Сертификат успешно получен"
else
  echo "Ошибка получения сертификата!"
fi 