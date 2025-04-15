#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

EMAIL=$1
DOMAIN="sovpadem.site"

if [ -z "$EMAIL" ]; then
  echo -e "${RED}Укажите email: $0 your@email.com${NC}"
  exit 1
fi

echo -e "${GREEN}[+] Остановка всех контейнеров${NC}"
docker compose down

echo -e "${GREEN}[+] Удаление всех данных certbot${NC}"
rm -rf ./data/certbot

echo -e "${GREEN}[+] Создание минимальной структуры папок${NC}"
mkdir -p ./data/certbot/www
mkdir -p ./nginx/logs

echo -e "${GREEN}[+] Очистка конфигурации nginx${NC}"
cat > ./nginx/conf/app.conf << EOF
server {
    listen 80;
    server_name sovpadem.site;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 "OK";
    }
}
EOF

echo -e "${GREEN}[+] Запуск только nginx${NC}"
docker compose up -d nginx
sleep 5

echo -e "${GREEN}[+] Создание тестового файла${NC}"
mkdir -p ./data/certbot/www
echo "test" > ./data/certbot/www/test.txt

echo -e "${GREEN}[+] Проверка доступности тестового файла${NC}"
curl http://$DOMAIN/.well-known/acme-challenge/test.txt

echo -e "${GREEN}[+] Получение сертификата${NC}"
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

echo -e "${GREEN}[+] Восстановление полной конфигурации nginx${NC}"
cat > ./nginx/conf/app.conf << EOF
server {
    listen 80;
    server_name sovpadem.site;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name sovpadem.site;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    # Настройки безопасности
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    
    # Логи
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Перенаправление запросов на бота
    location /telegram/bnsdfbcmbeworpvcbt {
        proxy_pass http://bot:3000/telegram/bnsdfbcmbeworpvcbt;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Страница проверки работоспособности
    location /health {
        proxy_pass http://bot:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Запрет доступа к другим путям
    location / {
        return 403;
    }
}
EOF

echo -e "${GREEN}[+] Запуск всего проекта${NC}"
docker compose up -d
echo -e "${GREEN}[+] Готово!${NC}" 