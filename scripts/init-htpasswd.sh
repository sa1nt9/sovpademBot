#!/bin/bash

# Скрипт для создания файла .htpasswd из переменных окружения

set -e

# Проверяем, что переменные окружения установлены
if [ -z "$LOGS_USERNAME" ] || [ -z "$LOGS_PASSWORD" ]; then
    echo "Ошибка: Переменные LOGS_USERNAME и LOGS_PASSWORD должны быть установлены в файле .env"
    exit 1
fi

# Создаем временный файл .htpasswd
echo "$LOGS_USERNAME:$(openssl passwd -apr1 $LOGS_PASSWORD)" > .htpasswd.tmp

# Копируем файл в контейнер nginx
docker compose exec -T nginx sh -c 'cat > /etc/nginx/.htpasswd' < .htpasswd.tmp

# Удаляем временный файл
rm .htpasswd.tmp

echo "Файл .htpasswd успешно создан с учетными данными из .env файла"
echo "Имя пользователя: $LOGS_USERNAME"
echo "Пароль: [скрыт]"

# Перезагружаем Nginx
docker compose exec nginx nginx -s reload

echo "Nginx перезагружен. Теперь вы можете использовать новые учетные данные для доступа к логам." 