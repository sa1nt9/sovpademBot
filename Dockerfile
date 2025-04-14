FROM node:22-alpine AS builder

WORKDIR /app

# Установка необходимых зависимостей для сборки нативных модулей
RUN apk add --no-cache python3 make g++ gcc libc-dev

# Копируем зависимости
COPY package*.json ./

# Устанавливаем все зависимости и обновляем package-lock.json
RUN npm install

# Копируем исходники
COPY . .

# Генерируем Prisma клиент и собираем приложение
RUN npm run prisma:generate && npm run build:prod

# Многоступенчатая сборка для уменьшения размера
FROM node:22-alpine AS production

WORKDIR /app

# Переменные окружения для продакшена
ENV NODE_ENV=production

# Устанавливаем необходимые зависимости для запуска нативных модулей
RUN apk add --no-cache libc6-compat

# Копируем только необходимые файлы из предыдущего этапа
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/locales ./locales
COPY --from=builder /app/node_modules ./node_modules

# Открываем порт (если необходимо для мониторинга)
# EXPOSE 3000

# Запускаем приложение
CMD ["node", "dist/main.js"] 