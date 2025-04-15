#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для печати статуса
print_status() {
  echo -e "${GREEN}[+] $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
  echo -e "${RED}[-] $1${NC}"
}

# Проверяем, указан ли домен
if [ -z "$1" ]; then
    print_error "Домен не указан!"
    echo "Использование: $0 <домен>"
    echo "Пример: $0 example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"webmaster@$DOMAIN"}

print_status "Начинаем генерацию SSL для домена $DOMAIN"

# Создаем необходимые директории
mkdir -p ./nginx/ssl/certs
mkdir -p ./nginx/ssl/private
mkdir -p ./nginx/logs

# Создаем файл конфигурации для OpenSSL
cat > ./nginx/ssl/openssl.cnf << EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = $DOMAIN

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
EOF

# Обновляем конфигурацию Nginx
print_status "Обновляем конфигурацию Nginx для домена $DOMAIN"
cat > ./nginx/conf/app.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN;
    
    ssl_certificate /etc/nginx/ssl/certs/server.crt;
    ssl_certificate_key /etc/nginx/ssl/private/server.key;
    
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

# Создаем файл .env с настройками домена
print_status "Обновляем .env файл с настройками домена"
grep -q "BOT_DOMAIN=" .env && sed -i "s/BOT_DOMAIN=.*/BOT_DOMAIN=$DOMAIN/" .env || echo "BOT_DOMAIN=$DOMAIN" >> .env
grep -q "WEBHOOK_PATH=" .env && sed -i "s|WEBHOOK_PATH=.*|WEBHOOK_PATH=/telegram/bnsdfbcmbeworpvcbt|" .env || echo "WEBHOOK_PATH=/telegram/bnsdfbcmbeworpvcbt" >> .env
grep -q "NODE_ENV=" .env && sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env || echo "NODE_ENV=production" >> .env

# Генерируем SSL-сертификаты
print_status "Генерируем SSL-сертификаты для $DOMAIN"
cd ./nginx/ssl

# Генерируем приватный ключ
openssl genrsa -out private/server.key 2048

# Генерируем самоподписанный сертификат
openssl req -x509 -new -nodes -key private/server.key -sha256 -days 365 -out certs/server.crt -config openssl.cnf

cd ../../

print_status "SSL-сертификаты успешно созданы!"
print_status "Теперь вы можете запустить: docker compose up -d" 