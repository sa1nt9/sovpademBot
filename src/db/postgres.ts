import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';

export const prisma = new PrismaClient();

export const postgresClient = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USERNAME || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'root',
    database: process.env.POSTGRES_NAME || 'postgres',
    
});

export const connectPostgres = async () => {
    try {
        await prisma.$connect();
        await postgresClient.connect()
        console.log('Postgres подключён через Prisma');
    } catch (error) {
        console.error('Ошибка при подключении к базе данных:', error);
        process.exit(1);
    }
};

export const disconnectPostgres = async () => {
    await prisma.$disconnect();
    await postgresClient.end()
};
