#!/bin/bash

# Скрипт для создания файла .htpasswd из переменных окружения

set -e

# Проверяем наличие файла .env
if [ ! -f .env ]; then
    echo "Ошибка: Файл .env не найден"
    exit 1
fi

# Загружаем переменные из .env файла
echo "Загружаем переменные из .env файла..."
export $(grep -v '^#' .env | xargs)

# Проверяем, что переменные окружения установлены
if [ -z "$ADMIN_USERNAME" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo "Ошибка: Переменные ADMIN_USERNAME и ADMIN_PASSWORD должны быть установлены в файле .env"
    exit 1
fi

echo "Переменные успешно загружены:"
echo "ADMIN_USERNAME: $ADMIN_USERNAME"
echo "ADMIN_PASSWORD: [скрыт]"

# Создаем временный файл .htpasswd
echo "$ADMIN_USERNAME:$(openssl passwd -apr1 $ADMIN_PASSWORD)" > .htpasswd.tmp

# Копируем файл в контейнер nginx
docker compose exec -T nginx sh -c 'cat > /etc/nginx/.htpasswd' < .htpasswd.tmp

# Удаляем временный файл
rm .htpasswd.tmp

echo "Файл .htpasswd успешно создан с учетными данными из .env файла"
echo "Имя пользователя: $ADMIN_USERNAME"
echo "Пароль: [скрыт]"

# Перезагружаем Nginx
docker compose exec nginx nginx -s reload

echo "Nginx перезагружен. Теперь вы можете использовать новые учетные данные для доступа к логам." 