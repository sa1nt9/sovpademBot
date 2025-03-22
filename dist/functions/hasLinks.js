"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasLinks = hasLinks;
exports.removeLinks = removeLinks;
const urlRegex_1 = require("../constants/regex/urlRegex");
const wwwRegex_1 = require("../constants/regex/wwwRegex");
function hasLinks(text) {
    if (!text)
        return false;
    // Проверка на наличие URL
    if (urlRegex_1.urlRegex.test(text)) {
        return true;
    }
    // Проверка на наличие www и t.me ссылок
    if (wwwRegex_1.wwwRegex.test(text)) {
        return true;
    }
    return false;
}
function removeLinks(text) {
    if (!text)
        return '';
    let result = text.replace(urlRegex_1.urlRegex, '[ссылка удалена]');
    // Удаление всех www и t.me ссылок
    result = result.replace(wwwRegex_1.wwwRegex, '[ссылка удалена]');
    return result;
}
