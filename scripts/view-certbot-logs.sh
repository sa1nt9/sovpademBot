#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}[+] Проверка наличия контейнера certbot${NC}"
if ! docker compose ps | grep -q certbot; then
  echo -e "${GREEN}[+] Запуск контейнера certbot${NC}"
  docker compose up -d certbot
  sleep 2
fi

echo -e "${GREEN}[+] Просмотр логов certbot из контейнера:${NC}"
docker compose exec certbot cat /var/log/letsencrypt/letsencrypt.log

# Если логи слишком длинные, можно использовать tail
echo -e "\n${GREEN}[+] Последние 50 строк логов:${NC}"
docker compose exec certbot sh -c "tail -n 50 /var/log/letsencrypt/letsencrypt.log" 