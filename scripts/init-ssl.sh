#!/bin/bash

# Скрипт для инициализации SSL сертификатов с помощью certbot

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
EMAIL=${2:-"webmaster@$DOMAIN"} # Если email не указан, используем webmaster@domain.com

print_status "Начинаем настройку SSL для домена $DOMAIN с email $EMAIL"

# Создаем необходимые директории
mkdir -p ./nginx/logs

# Обновляем конфигурацию Nginx
print_status "Обновляем конфигурацию Nginx для домена $DOMAIN"
sed -i "s/BOT_DOMAIN/$DOMAIN/g" ./nginx/conf/app.conf

# Создаем файл .env с настройками домена
print_status "Обновляем .env файл с настройками домена"
grep -q "BOT_DOMAIN=" .env && sed -i "s/# BOT_DOMAIN=.*/BOT_DOMAIN=$DOMAIN/" .env || echo "BOT_DOMAIN=$DOMAIN" >> .env
grep -q "NODE_ENV=" .env && sed -i "s/# NODE_ENV=.*/NODE_ENV=production/" .env || echo "NODE_ENV=production" >> .env

# Проверяем наличие Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    print_error "Docker не установлен"
    exit 1
fi

# Запускаем только контейнеры Nginx и Certbot
print_status "Запускаем временные контейнеры Nginx и Certbot для получения сертификатов"
docker compose up -d nginx certbot

# Ждем запуска Nginx
print_status "Ожидаем запуска Nginx..."
sleep 5

# Получаем SSL сертификат
print_status "Получаем SSL сертификат для $DOMAIN"
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d sovpadem.site

# Проверяем наличие сертификата
if [ -d "./nginx/certbot/conf/live/$DOMAIN" ]; then
    print_status "Сертификат успешно получен для $DOMAIN"
    
    # Останавливаем временные контейнеры
    docker compose stop nginx certbot
    
    # Запускаем все контейнеры
    print_status "Запускаем все контейнеры"
    docker compose up -d
    
    print_status "Настройка SSL завершена. Вебхук для бота настроен на https://$DOMAIN/telegram/webhook"
    print_status "Проверьте работу бота!"
else
    print_error "Не удалось получить сертификат для $DOMAIN"
    docker compose stop nginx certbot
    exit 1
fi 