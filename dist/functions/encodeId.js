"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeId = encodeId;
exports.decodeId = decodeId;
// Функция для кодирования ID в короткий формат
function encodeId(id) {
    // Преобразуем строку в число
    const num = parseInt(id);
    // Используем base36 (0-9 и a-z) для кодирования
    return num.toString(36);
}
// Функция для декодирования ID из короткого формата
function decodeId(encoded) {
    // Преобразуем из base36 обратно в число
    const num = parseInt(encoded, 36);
    return num.toString();
}
