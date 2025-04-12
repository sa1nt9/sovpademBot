import { urlRegex } from "../constants/regex/urlRegex";
import { wwwRegex } from "../constants/regex/wwwRegex";
import { logger } from "../logger";

export function hasLinks(text: string): boolean {
    if (!text) {
        logger.info('Empty text provided for link check');
        return false;
    }
        
    // Проверка на наличие URL
    if (urlRegex.test(text)) {
        logger.info({ textLength: text.length }, 'URL links found in text');
        return true;
    }
    
    // Проверка на наличие www и t.me ссылок
    if (wwwRegex.test(text)) {
        logger.info({ textLength: text.length }, 'WWW or t.me links found in text');
        return true;
    }
    
    logger.info({ textLength: text.length }, 'No links found in text');
    return false;
}

export function removeLinks(text: string): string {
    if (!text) {
        logger.info('Empty text provided for link removal');
        return '';
    }
    
    logger.info({ textLength: text.length }, 'Removing links from text');
    
    let result = text.replace(urlRegex, '[ссылка удалена]');
    
    // Удаление всех www и t.me ссылок
    result = result.replace(wwwRegex, '[ссылка удалена]');
    
    logger.info({ 
        originalLength: text.length, 
        resultLength: result.length 
    }, 'Links removed from text');
    
    return result;
} 