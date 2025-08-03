# Sovpadem Bot - Телеграм бот для знакомств

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

## Настройка веб-хуков для Telegram-бота

Для настройки веб-хуков вам потребуется домен и SSL-сертификат. Выполните следующие шаги:

1. **Приобретите домен** у любого регистратора доменов (например, reg.ru, namecheap.com)

2. **Настройте DNS-записи** для вашего домена, указав IP-адрес вашего сервера:
   ```
   A запись для domain.com -> IP вашего сервера
   ```

3. **Обновите переменные окружения**:
   ```
   NODE_ENV=production
   BOT_DOMAIN=your-domain.com
   WEBHOOK_PATH=/telegram/webhook
   ```

4. **Запустите скрипт инициализации SSL**:
   ```bash
   # Сделайте скрипт исполняемым
   chmod +x scripts/init-ssl.sh
   
   # Запустите скрипт, указав ваш домен
   ./scripts/init-ssl.sh your-domain.com your-email@example.com
   ```

5. **Проверьте статус веб-хука**:
   ```bash
   curl -X GET https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

**Примечание:** Веб-хуки работают только в production режиме. В development режиме бот будет использовать Long Polling.


## License

This project is licensed for personal and non-commercial use only.  
Any commercial use is prohibited without the author's written permission.  
See [LICENSE](./LICENSE) for details.  
Author: sa1nt9