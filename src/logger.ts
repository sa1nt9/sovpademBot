import fs from "fs";
import path from "path";
import { pino } from "pino";
import ffi from 'ffi-napi';
import os from 'os';

// Настройка кодировки для Windows
if (os.platform() === 'win32') {
    const kernel = ffi.Library('Kernel32', {
        'SetConsoleOutputCP': [ffi.types.bool, [ffi.types.uint]],
        'SetConsoleCP': [ffi.types.bool, [ffi.types.uint]]
    });
    const CP_UTF8 = 65001;
    kernel.SetConsoleOutputCP(CP_UTF8);
    kernel.SetConsoleCP(CP_UTF8);
}

// Определение окружения
const isProd = process.env.NODE_ENV === "production";

// Создание директории для логов
const logDir = path.resolve(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Настройка путей для лог-файлов
const logFilePath = path.join(logDir, "bot.log");
const errorLogFilePath = path.join(logDir, "error.log");
const debugLogFilePath = path.join(logDir, "debug.log");

// Конфигурация логгера
export const logger = pino({
    level: isProd ? "info" : "debug",
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
        targets: [
            // Вывод в консоль в режиме разработки
            ...(isProd ? [] : [{
                target: "pino-pretty",
                level: "debug",
                options: {
                    colorize: true,
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid,hostname",
                },
            }]),
            // Вывод всех логов в файл
            {
                target: "pino/file",
                level: "info",
                options: { 
                    destination: logFilePath,
                    mkdir: true,
                },
            },
            // Отдельный файл для ошибок
            {
                target: "pino/file",
                level: "error",
                options: { 
                    destination: errorLogFilePath,
                    mkdir: true,
                },
            },
            // Отдельный файл для отладочных сообщений
            {
                target: "pino/file",
                level: "debug",
                options: { 
                    destination: debugLogFilePath,
                    mkdir: true,
                },
            },
        ],
    },
    // Добавление полей по умолчанию ко всем записям лога
    base: {
        env: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        hostname: os.hostname(),
    },
});

export type Logger = typeof logger;
