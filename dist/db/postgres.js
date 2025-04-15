"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPostgres = exports.connectPostgres = exports.postgresClient = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
exports.prisma = new client_1.PrismaClient();
exports.postgresClient = new pg_1.Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USERNAME || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'root',
    database: process.env.POSTGRES_NAME || 'postgres',
});
const connectPostgres = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.prisma.$connect();
        yield exports.postgresClient.connect();
        console.log('Postgres подключён через Prisma');
    }
    catch (error) {
        console.error('Ошибка при подключении к базе данных:', error);
        process.exit(1);
    }
});
exports.connectPostgres = connectPostgres;
const disconnectPostgres = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
    yield exports.postgresClient.end();
});
exports.disconnectPostgres = disconnectPostgres;
