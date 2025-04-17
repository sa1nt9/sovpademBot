#!/bin/bash

# Настройки
BACKUP_DIR="/app/data/backups"
DB_NAME="${POSTGRES_NAME}"
DB_USER="${POSTGRES_USERNAME}"
DB_HOST="postgres"
DB_PASSWORD="${POSTGRES_PASSWORD}"

# Проверяем наличие параметра - пути к бэкапу
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Available backups:"
  echo "===== Daily backups ====="
  ls -lh $BACKUP_DIR/daily
  echo "===== Weekly backups ====="
  ls -lh $BACKUP_DIR/weekly
  exit 1
fi

BACKUP_FILE="$1"

# Проверяем существование файла бэкапа
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file does not exist: $BACKUP_FILE"
  exit 1
fi

echo "Restoring PostgreSQL database from backup: $BACKUP_FILE"
echo "WARNING: This will overwrite the current database!"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Получаем имя базы для создания имени временного файла
BACKUP_FILENAME=$(basename "$BACKUP_FILE")
TEMP_SQL="/tmp/${BACKUP_FILENAME%.gz}.sql"

# Распаковываем gzip файл
echo "Decompressing backup file..."
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

# Восстанавливаем базу данных
echo "Restoring database $DB_NAME..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME < "$TEMP_SQL"

# Проверяем успешность восстановления
if [ $? -eq 0 ]; then
  echo "Database successfully restored from backup: $BACKUP_FILE"
else
  echo "Error restoring database from backup"
  exit 1
fi

# Удаляем временный файл
rm -f "$TEMP_SQL"
echo "Cleanup completed" 