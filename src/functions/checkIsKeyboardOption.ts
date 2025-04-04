import { ReplyKeyboardMarkup } from "grammy/types"

export const checkIsKeyboardOption = (keyboard: ReplyKeyboardMarkup, message?: string): boolean => {
    if (!message) return false
    return keyboard.keyboard.some(row => row.some(button => button === message))
}
