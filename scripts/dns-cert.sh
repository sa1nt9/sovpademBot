#!/bin/bash
DOMAIN="sovpadem.site"

echo "Этот скрипт запустит получение сертификата с помощью DNS-проверки"
echo "Вам нужно будет внести запись TXT в DNS для проверки владения доменом"

# Запускаем certbot с DNS challenge
docker compose run -it --rm certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d $DOMAIN

# Проверяем результат
if [ $? -eq 0 ]; then
  echo "Сертификат успешно получен!"
  
  # Перезапускаем nginx для применения сертификата
  docker compose restart nginx
else
  echo "Не удалось получить сертификат"
fi 