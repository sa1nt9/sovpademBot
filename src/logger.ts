import fs from "fs";
import path from "path";
import { pino } from "pino";
import ffi from 'ffi-napi';
import os from 'os';

if (os.platform() === 'win32') {
    const kernel = ffi.Library('Kernel32', {
        'SetConsoleOutputCP': [ffi.types.bool, [ffi.types.uint]],
        'SetConsoleCP': [ffi.types.bool, [ffi.types.uint]]
    });
    const CP_UTF8 = 65001;
    kernel.SetConsoleOutputCP(CP_UTF8);
    kernel.SetConsoleCP(CP_UTF8);
}

const isProd = process.env.NODE_ENV === "production";

const logFilePath = path.resolve(__dirname, "../logs/bot.log");

const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Конфигурируем логгер
export const logger = pino({
    level: "info",
    transport: {
        targets: [
            ...(isProd
                ? [
                    {
                        target: "pino/file",
                        level: "info",
                        options: { destination: logFilePath },
                    },
                ]
                : [
                    {
                        target: "pino-pretty",
                        level: "info",
                        options: {
                            ignore: "pid,hostname",
                            colorize: true,
                            translateTime: "HH:MM:ss Z",
                        },
                    },
                ]),
        ],
    },
});

export type Logger = typeof logger;
