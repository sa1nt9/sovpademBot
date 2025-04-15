"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pino_1 = require("pino");
const os_1 = __importDefault(require("os"));
// import ffi from 'ffi-napi';
// 
// // Настройка кодировки для Windows
// if (os.platform() === 'win32') {
//     const kernel = ffi.Library('Kernel32', {
//         'SetConsoleOutputCP': [ffi.types.bool, [ffi.types.uint]],
//         'SetConsoleCP': [ffi.types.bool, [ffi.types.uint]]
//     });
//     const CP_UTF8 = 65001;
//     kernel.SetConsoleOutputCP(CP_UTF8);
//     kernel.SetConsoleCP(CP_UTF8);
// }
// Определение окружения
const isProd = process.env.NODE_ENV === "production";
// Создание директории для логов
const logDir = path_1.default.resolve(__dirname, "../logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Настройка путей для лог-файлов
const logFilePath = path_1.default.join(logDir, "bot.log");
const errorLogFilePath = path_1.default.join(logDir, "error.log");
const debugLogFilePath = path_1.default.join(logDir, "debug.log");
// Конфигурация логгера
exports.logger = (0, pino_1.pino)({
    level: isProd ? "info" : "debug",
    timestamp: pino_1.pino.stdTimeFunctions.isoTime,
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
        hostname: os_1.default.hostname(),
    },
});
