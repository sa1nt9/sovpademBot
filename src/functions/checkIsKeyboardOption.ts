import { ReplyKeyboardMarkup } from "grammy/types"
import { logger } from "../logger";

export const checkIsKeyboardOption = (keyboard: ReplyKeyboardMarkup, message?: string): boolean => {
    if (!message) {
        logger.warn('No message provided for keyboard option check');
        return false;
    }
    
    const isOption = keyboard.keyboard.some(row => row.some(button => button === message));
    logger.info({ message, isOption }, 'Checked if message is a keyboard option');
    
    return isOption;
}
