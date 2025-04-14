import { QueueOptions } from 'bull';
import * as dotenv from 'dotenv';

// Базовая конфигурация для очередей Bull
export const bullConfig: QueueOptions = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    defaultJobOptions: {
        attempts: 3, // Количество попыток при ошибке
        backoff: {
            type: 'exponential',
            delay: 5000, // Начальная задержка перед повторной попыткой
        },
        removeOnComplete: true, // Удалять успешно выполненные задачи
        removeOnFail: 100, // Хранить не более 100 проваленных задач
    },
}; 