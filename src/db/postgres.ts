import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectPostgres = async () => {
    try {
        await prisma.$connect();
        console.log('Postgres подключён через Prisma');
    } catch (error) {
        console.error('Ошибка при подключении к базе данных:', error);
        process.exit(1);
    }
};

export const disconnectPostgres = async () => {
    await prisma.$disconnect();
};
