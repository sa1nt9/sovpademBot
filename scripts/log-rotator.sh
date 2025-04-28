#!/bin/bash

# Скрипт для автоматического копирования логов Docker контейнера

# Цвета для вывода
GREEN='\033[0;32m'
NC='\033[0m'

# Путь к директории с логами
LOG_DIR="../logs"
CONTAINER_NAME="sovpadembot-bot-1"

# Создаем директорию для логов, если она не существует
mkdir -p "$LOG_DIR"

# Функция для копирования логов
copy_logs() {
    echo -e "${GREEN}[+] Копирование логов контейнера $CONTAINER_NAME...${NC}"
    
    # Получаем ID контейнера
    CONTAINER_ID=$(docker ps -qf "name=$CONTAINER_NAME")
    
    if [ -z "$CONTAINER_ID" ]; then
        echo "Контейнер $CONTAINER_NAME не найден"
        return 1
    fi
    
    # Копируем логи
    docker logs "$CONTAINER_ID" > "$LOG_DIR/bot_container.log" 2>&1
    
    echo -e "${GREEN}[+] Логи успешно скопированы в $LOG_DIR/bot_container.log${NC}"
}

# Основной цикл
while true; do
    copy_logs
    sleep 60  # Копируем логи каждую минуту
done 