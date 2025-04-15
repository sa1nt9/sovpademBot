# Система бэкапов для PostgreSQL

## Описание
Эта система бэкапов автоматически создает и управляет резервными копиями базы данных PostgreSQL:

- **Ежедневные бэкапы**: Создаются каждый день в 2:00 UTC и хранятся в течение 7 дней
- **Еженедельные бэкапы**: Создаются каждое воскресенье и хранятся в течение 12 недель

## Как это работает

1. Бэкапы запускаются автоматически через cron каждую ночь
2. Система хранит бэкапы в двух категориях:
   - `/app/data/backups/daily/` - ежедневные бэкапы за последние 7 дней
   - `/app/data/backups/weekly/` - еженедельные бэкапы за последние 12 недель
3. Старые бэкапы удаляются автоматически по правилам ротации
4. Все операции логируются в файл `/app/data/backups/backup.log`

## Ручное создание бэкапа

Для ручного создания бэкапа выполните:

```bash
docker-compose exec backup /scripts/postgres-backup.sh
```

## Восстановление из бэкапа

Для восстановления базы данных из бэкапа:

1. Просмотрите доступные бэкапы:
```bash
docker-compose exec backup /scripts/postgres-restore.sh
```

2. Выберите нужный бэкап и выполните восстановление:
```bash
docker-compose exec backup /scripts/postgres-restore.sh /app/data/backups/daily/postgres_daily_2024-09-01.sql.gz
```
или
```bash
docker-compose exec backup /scripts/postgres-restore.sh /app/data/backups/weekly/postgres_weekly_2024-08-25.sql.gz
```

## Изменение настроек

Настройки системы бэкапов можно изменить в файле `/scripts/backup/postgres-backup.sh`:

- `DAILY_DAYS_TO_KEEP` - количество дней хранения ежедневных бэкапов (по умолчанию 7)
- `WEEKLY_WEEKS_TO_KEEP` - количество недель хранения еженедельных бэкапов (по умолчанию 12)

## Проверка статуса

Для проверки статуса последнего бэкапа:

```bash
docker-compose exec backup tail -n 50 /app/data/backups/backup.log
```

## Объем и хранение

Все бэкапы хранятся в Docker volume `db_backups`, который сохраняется даже при пересоздании контейнеров. 