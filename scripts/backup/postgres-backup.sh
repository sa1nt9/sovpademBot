#!/bin/bash

# Настройки
BACKUP_DIR="/app/data/backups"
DB_NAME="${POSTGRES_NAME}"
DB_USER="${POSTGRES_USERNAME}"
DB_HOST="postgres"
DB_PASSWORD="${POSTGRES_PASSWORD}"

# Настройки ротации
DAILY_DAYS_TO_KEEP=7             # Хранить ежедневные бэкапы за последние 7 дней
WEEKLY_WEEKS_TO_KEEP=12          # Хранить еженедельные бэкапы за последние 12 недель

# Создаем директории для бэкапов
mkdir -p $BACKUP_DIR/daily
mkdir -p $BACKUP_DIR/weekly

# Текущая дата
DATE=$(date +%Y-%m-%d)
DOW=$(date +%u)  # День недели (1-7, где 1 - понедельник)

# Форматы имени файлов
DAILY_FILENAME="postgres_daily_${DATE}.sql.gz"
WEEKLY_FILENAME="postgres_weekly_${DATE}.sql.gz"

echo "[$DATE] Starting PostgreSQL backup..."

# Создаем бэкап с сжатием
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_DIR/daily/$DAILY_FILENAME"

# Проверяем успешность создания бэкапа
if [ $? -eq 0 ]; then
  echo "[$DATE] Daily backup successfully created: $DAILY_FILENAME"
  
  # Если сегодня воскресенье (DOW=7), создаем еженедельную копию
  if [ "$DOW" = "7" ]; then
    cp "$BACKUP_DIR/daily/$DAILY_FILENAME" "$BACKUP_DIR/weekly/$WEEKLY_FILENAME"
    echo "[$DATE] Weekly backup created: $WEEKLY_FILENAME"
  fi
  
  # Удаляем старые ежедневные бэкапы (старше DAILY_DAYS_TO_KEEP дней)
  find $BACKUP_DIR/daily -name "postgres_daily_*.sql.gz" -mtime +$DAILY_DAYS_TO_KEEP -delete
  echo "[$DATE] Old daily backups removed (older than $DAILY_DAYS_TO_KEEP days)"
  
  # Удаляем старые еженедельные бэкапы (старше WEEKLY_WEEKS_TO_KEEP недель)
  find $BACKUP_DIR/weekly -name "postgres_weekly_*.sql.gz" -mtime +$((WEEKLY_WEEKS_TO_KEEP * 7)) -delete
  echo "[$DATE] Old weekly backups removed (older than $WEEKLY_WEEKS_TO_KEEP weeks)"
  
  # Считаем занимаемое место
  TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
  echo "[$DATE] Total backup size: $TOTAL_SIZE"
else
  echo "[$DATE] Error creating backup"
  exit 1
fi

# Создаем отчет о доступных бэкапах
echo "[$DATE] Available backups:"
echo "===== Daily backups ====="
ls -lh $BACKUP_DIR/daily | grep -v total
echo "===== Weekly backups ====="
ls -lh $BACKUP_DIR/weekly | grep -v total

echo "[$DATE] Backup process completed" 