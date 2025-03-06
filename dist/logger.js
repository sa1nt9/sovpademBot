"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pino_1 = require("pino");
const ffi_napi_1 = __importDefault(require("ffi-napi"));
const os_1 = __importDefault(require("os"));
if (os_1.default.platform() === 'win32') {
    const kernel = ffi_napi_1.default.Library('Kernel32', {
        'SetConsoleOutputCP': [ffi_napi_1.default.types.bool, [ffi_napi_1.default.types.uint]],
        'SetConsoleCP': [ffi_napi_1.default.types.bool, [ffi_napi_1.default.types.uint]]
    });
    const CP_UTF8 = 65001;
    kernel.SetConsoleOutputCP(CP_UTF8);
    kernel.SetConsoleCP(CP_UTF8);
}
const isProd = process.env.NODE_ENV === "production";
const logFilePath = path_1.default.resolve(__dirname, "../logs/bot.log");
const logDir = path_1.default.dirname(logFilePath);
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Конфигурируем логгер
exports.logger = (0, pino_1.pino)({
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
