"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsKeyboardOption = void 0;
const logger_1 = require("../logger");
const checkIsKeyboardOption = (keyboard, message) => {
    if (!message) {
        logger_1.logger.warn('No message provided for keyboard option check');
        return false;
    }
    const isOption = keyboard.keyboard.some(row => row.some(button => button === message));
    logger_1.logger.info({ message, isOption }, 'Checked if message is a keyboard option');
    return isOption;
};
exports.checkIsKeyboardOption = checkIsKeyboardOption;
