# Sovpad Bot - Телеграм бот для знакомств

## Деплой на сервер

### Требования
- Linux/Unix сервер
- Docker и Docker Compose
- Git

### Шаги для деплоя

1. Клонировать репозиторий
```bash
git clone <ссылка на репозиторий>
cd sovpademBot
```

2. Настроить файл окружения
```bash
# Отредактировать файл .env со своими данными
nano .env
```

Убедитесь, что указаны корректные значения для:
- BOT_TOKEN (токен вашего Telegram бота от BotFather)
- POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USERNAME, POSTGRES_PASSWORD, POSTGRES_NAME
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- CHANNEL_USERNAME, CHANNEL_NAME, BOT_USERNAME

3. Запустить скрипт деплоя
```bash
chmod +x deploy.sh
./deploy.sh
```

Скрипт автоматически:
- Проверит наличие Docker и Docker Compose
- Запустит контейнеры с базой данных, Redis и ботом
- Применит миграции базы данных
- Выведет логи работы бота

### Управление ботом

Для работы с меню управления ботом запустите:
```bash
./deploy.sh --menu
```

Доступные опции:
1. Запустить бота
2. Обновить бота (загрузить обновления и перезапустить)
3. Просмотреть логи
4. Остановить бота
5. Выход

### Оптимизация производительности

Бот использует:
- Многопоточную обработку через систему очередей (Bull с Redis)
- TypeScript с компиляцией в оптимизированный JavaScript
- Многоэтапную сборку Docker для уменьшения размера образа
- Prisma ORM для эффективной работы с базой данных

### Мониторинг

Для мониторинга работы используйте логи контейнеров:
```bash
docker compose logs -f
```

Для мониторинга базы данных Prisma Studio:
```bash
docker compose exec bot npm run prisma:studio
```