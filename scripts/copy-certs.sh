#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Скрипт нужно запустить с правами root!${NC}"
  echo "Используйте: sudo $0"
  exit 1
fi

echo -e "${GREEN}Создаем директории для сертификатов...${NC}"
mkdir -p ./data/certbot/conf/live/sovpadem.site

echo -e "${GREEN}Копируем сертификаты из системной директории...${NC}"
cp -L /etc/letsencrypt/live/sovpadem.site/fullchain.pem ./data/certbot/conf/live/sovpadem.site/
cp -L /etc/letsencrypt/live/sovpadem.site/privkey.pem ./data/certbot/conf/live/sovpadem.site/

echo -e "${GREEN}Устанавливаем правильные права...${NC}"
chmod 755 ./data/certbot/conf/live
chmod 755 ./data/certbot/conf/live/sovpadem.site
chmod 644 ./data/certbot/conf/live/sovpadem.site/fullchain.pem
chmod 600 ./data/certbot/conf/live/sovpadem.site/privkey.pem

echo -e "${GREEN}Обновляем конфигурацию nginx...${NC}"
cat > ./nginx/conf/app.conf << EOF
server {
    listen 80;
    server_name sovpadem.site;
    
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name sovpadem.site;
    
    ssl_certificate /etc/letsencrypt/live/sovpadem.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sovpadem.site/privkey.pem;
    
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

echo -e "${GREEN}Изменяем docker-compose.yml для монтирования системных сертификатов...${NC}"
sed -i 's|./data/certbot/conf:/etc/letsencrypt|/etc/letsencrypt:/etc/letsencrypt|g' docker-compose.yml

echo -e "${GREEN}Перезапускаем контейнеры...${NC}"
docker compose down
docker compose up -d

echo -e "${GREEN}Готово! Сертификаты внедрены в проект.${NC}"
echo -e "${GREEN}Проверка работы бота:${NC}"
curl -I https://sovpadem.site/health 