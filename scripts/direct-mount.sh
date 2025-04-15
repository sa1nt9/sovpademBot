#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Наиболее простой вариант - монтировать системные сертификаты напрямую${NC}"

echo -e "${GREEN}Изменяем docker-compose.yml...${NC}"

# Создаем бэкап docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Изменяем конфигурацию nginx - заменяем путь к сертификатам
sed -i 's|./data/certbot/conf:/etc/letsencrypt|/etc/letsencrypt:/etc/letsencrypt|g' docker-compose.yml

echo -e "${GREEN}Изменения внесены в docker-compose.yml${NC}"
echo -e "${GREEN}Перезапускаем контейнеры...${NC}"

docker compose down 
docker compose up -d

echo -e "${GREEN}Готово! Проверьте работу бота:${NC}"
echo -e "${GREEN}curl -I https://sovpadem.site/health${NC}" 