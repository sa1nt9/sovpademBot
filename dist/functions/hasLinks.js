"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasLinks = hasLinks;
exports.removeLinks = removeLinks;
const urlRegex_1 = require("../constants/regex/urlRegex");
const wwwRegex_1 = require("../constants/regex/wwwRegex");
const logger_1 = require("../logger");
function hasLinks(text) {
    if (!text) {
        logger_1.logger.info('Empty text provided for link check');
        return false;
    }
    // Проверка на наличие URL
    if (urlRegex_1.urlRegex.test(text)) {
        logger_1.logger.info({ textLength: text.length }, 'URL links found in text');
        return true;
    }
    // Проверка на наличие www и t.me ссылок
    if (wwwRegex_1.wwwRegex.test(text)) {
        logger_1.logger.info({ textLength: text.length }, 'WWW or t.me links found in text');
        return true;
    }
    logger_1.logger.info({ textLength: text.length }, 'No links found in text');
    return false;
}
function removeLinks(text) {
    if (!text) {
        logger_1.logger.info('Empty text provided for link removal');
        return '';
    }
    logger_1.logger.info({ textLength: text.length }, 'Removing links from text');
    let result = text.replace(urlRegex_1.urlRegex, '[ссылка удалена]');
    // Удаление всех www и t.me ссылок
    result = result.replace(wwwRegex_1.wwwRegex, '[ссылка удалена]');
    logger_1.logger.info({
        originalLength: text.length,
        resultLength: result.length
    }, 'Links removed from text');
    return result;
}
