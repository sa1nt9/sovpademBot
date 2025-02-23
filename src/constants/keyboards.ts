import { TranslateFunction } from "@grammyjs/i18n"
import { ForceReply, InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types"


export const languageKeyboard: ReplyKeyboardMarkup = {
    keyboard: [
        ['🇷🇺 Русский', '🇬🇧 English', '🇺🇦 Українська'],
        ['🇰🇿 Қазақша', '🇮🇩 Indonesia', '🇪🇸 Español'],
        ['🇵🇱 Polski', '🇮🇳 हिंदी', '🇮🇹 Italiano'],
        ['🇫🇷 Français', '🇩🇪 Deutsch', '🇧🇷 Português'],
    ],
    resize_keyboard: true,
}

export const acceptPrivacyKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("ok")]
    ],
    resize_keyboard: true,
})

export const genderKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t('i_woman'), t('i_man')]
    ],
    resize_keyboard: true,
})

export const interestedInKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t('women'), t('men'), t("not_matter")]
    ],
    resize_keyboard: true,
})


export const cityKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [{ text: t("send_location"), request_location: true }]
    ],
    resize_keyboard: true,
})