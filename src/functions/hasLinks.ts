import { urlRegex } from "../constants/regex/urlRegex";
import { wwwRegex } from "../constants/regex/wwwRegex";

export function hasLinks(text: string): boolean {
    if (!text) return false;
        
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

export function removeLinks(text: string): string {
    if (!text) return '';
    

    let result = text.replace(urlRegex, '[ссылка удалена]');
    
    // Удаление всех www и t.me ссылок
    result = result.replace(wwwRegex, '[ссылка удалена]');
    
    return result;
} 