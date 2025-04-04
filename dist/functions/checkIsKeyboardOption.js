"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsKeyboardOption = void 0;
const checkIsKeyboardOption = (keyboard, message) => {
    if (!message)
        return false;
    return keyboard.keyboard.some(row => row.some(button => button === message));
};
exports.checkIsKeyboardOption = checkIsKeyboardOption;
