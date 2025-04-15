FROM node:22-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++ gcc libc-dev

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Генерируем Prisma клиент и собираем приложение
RUN npx prisma generate
RUN npm run build || npm run tsc

# Образ для запуска
FROM node:22-alpine AS production

WORKDIR /app

# Устанавливаем зависимости для запуска
RUN apk add --no-cache libc6-compat

# Переменные окружения для продакшена
ENV NODE_ENV=production

# Копируем только необходимые файлы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/locales ./locales
COPY --from=builder /app/data ./data
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Создаем директорию для логов
RUN mkdir -p logs

# Запускаем приложение
CMD ["node", "dist/main.js"] 