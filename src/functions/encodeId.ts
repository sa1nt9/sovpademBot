// Функция для кодирования ID в короткий формат
export function encodeId(id: string): string {
    // Преобразуем строку в число
    const num = parseInt(id);
    // Используем base36 (0-9 и a-z) для кодирования
    return num.toString(36);
}

// Функция для декодирования ID из короткого формата
export function decodeId(encoded: string): string {
    // Преобразуем из base36 обратно в число
    const num = parseInt(encoded, 36);
    return num.toString();
} 