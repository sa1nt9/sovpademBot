# Просмотрщик логов для бота "Совпадём"

Простой веб-интерфейс для удобного просмотра и анализа лог-файлов бота.

## Возможности

- 🔍 Просмотр всех лог-файлов в удобном веб-интерфейсе
- 🔎 Поиск по содержимому логов 
- 📊 Цветовая подсветка разных типов сообщений (ошибки, предупреждения, информация)
- 📑 Пагинация для больших файлов
- 🔄 Легкое обновление содержимого в реальном времени

## Как использовать

### Локально

1. Запустите сервер просмотра логов:

```bash
npm run logs
```

2. Откройте в браузере адрес: `http://localhost:3030`

3. Выберите файл лога для просмотра из списка

### На сервере

1. Добавьте в docker-compose.yml новый сервис:

```yaml
  log-viewer:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "127.0.0.1:3030:3030"
    environment:
      - LOG_VIEWER_PORT=3030
    volumes:
      - ./logs:/app/logs
      - ./scripts:/app/scripts
    command: node scripts/log-viewer/log-server.js
    networks:
      - app_network
```

2. Обновите nginx конфигурацию для проксирования запросов (пример):

```nginx
server {
    # ... существующая конфигурация ...

    # Логи
    location /logs/ {
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://log-viewer:3030/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. Для добавления базовой защиты, создайте файл с паролем:

```bash
sudo apt-get install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

4. Перезапустите контейнеры:

```bash
docker-compose up -d
```

5. Теперь вы можете получить доступ к логам через: `https://ваш-домен/logs/`

## Настройка

Вы можете изменить порт в `scripts/log-viewer/log-server.js` или установить переменную окружения `LOG_VIEWER_PORT`.

## Дополнительные рекомендации

1. **Ротация логов**: Для долгосрочного использования рекомендуется настроить ротацию логов:

```bash
# Пример настройки logrotate
sudo nano /etc/logrotate.d/sovpadem-bot

# Содержимое файла
/path/to/sovpademBot/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

2. **Мониторинг**: Рассмотрите возможность интеграции с ELK Stack (Elasticsearch, Logstash, Kibana) или Grafana+Loki для более продвинутого анализа логов в будущем.

3. **Безопасность**: Убедитесь, что ваш просмотрщик логов доступен только авторизованным пользователям, особенно если вы размещаете его на публичном сервере. 