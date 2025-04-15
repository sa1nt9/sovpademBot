#!/bin/bash

# Скрипт для деплоя Telegram-бота на сервер

set -e

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

# Проверка наличия Docker и Docker Compose
check_dependencies() {
  print_status "Проверка зависимостей..."
  
  if ! command -v docker &> /dev/null; then
    print_error "Docker не установлен. Устанавливаю Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_warning "Необходим перезапуск сессии. Пожалуйста, выйдите и войдите снова, затем повторите запуск скрипта."
    exit 1
  fi
  
  if ! command -v docker compose &> /dev/null; then
    print_warning "Docker Compose не установлен как плагин. Проверяю наличие docker-compose..."
    if ! command -v docker-compose &> /dev/null; then
      print_error "Docker Compose не установлен. Устанавливаю Docker Compose..."
      sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      sudo chmod +x /usr/local/bin/docker-compose
    fi
  fi
  
  print_status "Все зависимости установлены."
}

# Остановка всех контейнеров
stop_containers() {
  print_status "Останавливаем все контейнеры..."
  docker compose down --remove-orphans || true
}

# Функция для запуска приложения
start_application() {
  print_status "Запуск приложения..."
  
  # Проверка наличия файла .env
  if [ ! -f .env ]; then
    print_error "Файл .env не найден. Создайте файл .env и укажите необходимые переменные окружения."
    exit 1
  fi
  
  # Останавливаем предыдущие контейнеры
  stop_containers
  
  # Запуск контейнеров
  docker compose up -d postgres redis
  
  # Ждем запуска базы данных
  print_status "Ожидание запуска базы данных..."
  sleep 10
  
  # Сборка и запуск контейнеров бота и бэкапа
  docker compose up -d --build bot backup
  
  # Проверка статуса
  if [ $? -eq 0 ]; then
    print_status "Приложение успешно запущено!"
    print_status "Статус контейнеров:"
    docker compose ps
  else
    print_error "Не удалось запустить приложение. Проверьте логи контейнеров."
    exit 1
  fi
}

# Функция для применения миграций базы данных
apply_migrations() {
  print_status "Применение миграций базы данных..."
  
  # Дожидаемся запуска контейнера с ботом
  until docker compose ps bot | grep -q "Up"; do
    print_warning "Контейнер с ботом еще не запущен. Ожидание..."
    sleep 5
  done
  
  # Выполняем миграции через npx prisma
  docker compose exec bot sh -c 'cd /app && npx prisma migrate deploy --schema=./prisma/schema.prisma'
  
  if [ $? -eq 0 ]; then
    print_status "Миграции успешно применены!"
  else
    print_error "Не удалось применить миграции. Проверьте логи."
    exit 1
  fi
}

# Функция для обновления приложения
update_application() {
  print_status "Обновление приложения..."
  
  # Загружаем последние изменения из репозитория
  git pull origin main || { print_error "Не удалось получить последние изменения из репозитория"; exit 1; }
  
  # Пересобираем контейнеры
  docker compose down
  docker compose build --no-cache bot
  docker compose up -d postgres redis bot backup
  
  # Проверка статуса
  if [ $? -eq 0 ]; then
    print_status "Приложение успешно обновлено!"
    print_status "Статус контейнеров:"
    docker compose ps
    
    # Применяем миграции
    apply_migrations
  else
    print_error "Не удалось обновить приложение. Проверьте логи контейнеров."
    exit 1
  fi
}

# Функция для просмотра логов
view_logs() {
  print_status "Вывод логов контейнера с ботом (для выхода нажмите Ctrl+C)..."
  docker compose logs -f bot
}

# Функция для просмотра логов бэкапа
view_backup_logs() {
  print_status "Вывод логов контейнера с бэкапом (для выхода нажмите Ctrl+C)..."
  docker compose logs -f backup
  
  # Также показываем лог бэкапа если он есть
  if docker compose exec backup test -f /app/data/backups/backup.log; then
    print_status "Содержимое лога бэкапа:"
    docker compose exec backup cat /app/data/backups/backup.log
  fi
}

# Функция для ручного запуска бэкапа
run_backup() {
  print_status "Запуск ручного бэкапа базы данных..."
  docker compose exec backup /scripts/postgres-backup.sh
}

# Функция для вывода меню
show_menu() {
  echo -e "\n${GREEN}=== Меню управления ботом ===${NC}"
  echo -e "1. Запустить бота"
  echo -e "2. Обновить бота"
  echo -e "3. Просмотреть логи бота"
  echo -e "4. Просмотреть логи бэкапа"
  echo -e "5. Запустить бэкап вручную"
  echo -e "6. Остановить все контейнеры"
  echo -e "7. Выход"
  echo -e "Выберите действие (1-7): \c"
  read choice
  
  case $choice in
    1) start_application; apply_migrations ;;
    2) update_application ;;
    3) view_logs ;;
    4) view_backup_logs ;;
    5) run_backup ;;
    6) docker compose down; print_status "Все контейнеры остановлены" ;;
    7) exit 0 ;;
    *) print_error "Неверный выбор. Пожалуйста, выберите действие от 1 до 7." ;;
  esac
}

# Главная функция
main() {
  check_dependencies
  
  if [ "$1" == "--menu" ]; then
    show_menu
  else
    print_status "Начинаем процесс деплоя..."
    start_application
    apply_migrations
    view_logs
  fi
}

# Запуск главной функции
main "$@" 