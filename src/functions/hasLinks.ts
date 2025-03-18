/**
 * Проверяет наличие ссылок в тексте.
 * Обнаруживает HTTP, HTTPS URL-адреса, www-ссылки и t.me/username ссылки
 * 
 * @param text Текст для проверки
 * @returns Булево значение, указывающее на наличие ссылки
 */
export function hasLinks(text: string): boolean {
    if (!text) return false;
    
    // Регулярное выражение для обнаружения URL
    const urlRegex = /(https?:\/\/[^\s]+)|([^\s]+\.[a-z]{2,}[^\s]*)|([^\s]+\.com[^\s]*)|([^\s]+\.ru[^\s]*)|([^\s]+\.org[^\s]*)|([^\s]+\.net[^\s]*)|([^\s]+\.io[^\s]*)|([^\s]+(\.)[^\s]*[a-z]{2,3}\/[^\s]*)/gi;
    
    // Регулярное выражение для обнаружения www и t.me ссылок
    const wwwRegex = /(www\.[^\s]+)|(t\.me\/[^\s]+)|(tg:\/\/[^\s]+)|(telegram\.me\/[^\s]+)|(vk\.com\/[^\s]+)|(fb\.com\/[^\s]+)|(ok\.ru\/[^\s]+)/gi;
    
    // Проверка на наличие URL
    if (urlRegex.test(text)) {
        return true;
    }
    
    // Проверка на наличие www и t.me ссылок
    if (wwwRegex.test(text)) {
        return true;
    }
    
    return false;
}

/**
 * Удаляет все ссылки из текста
 * 
 * @param text Текст для обработки
 * @returns Текст без ссылок
 */
export function removeLinks(text: string): string {
    if (!text) return '';
    
    // Регулярное выражение для обнаружения URL
    const urlRegex = /(https?:\/\/[^\s]+)|([^\s]+\.[a-z]{2,}[^\s]*)|([^\s]+\.com[^\s]*)|([^\s]+\.ru[^\s]*)|([^\s]+\.org[^\s]*)|([^\s]+\.net[^\s]*)|([^\s]+\.io[^\s]*)|([^\s]+(\.)[^\s]*[a-z]{2,3}\/[^\s]*)/gi;
    
    // Регулярное выражение для обнаружения www и t.me ссылок
    const wwwRegex = /(www\.[^\s]+)|(t\.me\/[^\s]+)|(tg:\/\/[^\s]+)|(telegram\.me\/[^\s]+)|(vk\.com\/[^\s]+)|(fb\.com\/[^\s]+)|(ok\.ru\/[^\s]+)/gi;
    
    // Удаление всех URL
    let result = text.replace(urlRegex, '[ссылка удалена]');
    
    // Удаление всех www и t.me ссылок
    result = result.replace(wwwRegex, '[ссылка удалена]');
    
    return result;
} 