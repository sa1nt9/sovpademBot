import { TranslateFunction } from "@grammyjs/i18n"
import { ForceReply, InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types"
import { ISessionData } from "../typescript/interfaces/ISessionData"


export const languageKeyboard: ReplyKeyboardMarkup = {
    keyboard: [
        ['🇷🇺 Русский', '🇬🇧 English', '🇺🇦 Українська'],
        ['🇰🇿 Қазақша', '🇮🇩 Indonesia', '🇪🇸 Español'],
        ['🇵🇱 Polski', '🇮🇳 हिंदी', '🇮🇹 Italiano'],
        ['🇫🇷 Français', '🇩🇪 Deutsch', '🇧🇷 Português'],
    ],
    resize_keyboard: true,
}

export const prepareMessageKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [[t("ok_lets_start")]],
    resize_keyboard: true,
})

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


export const cityKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup => ({
    keyboard: (session.form?.city ? [[`${session.form?.myCoordinates ? "📍 " : ""}${session.form?.city}`], [{ text: t("send_location"), request_location: true }]] : [[{ text: t("send_location"), request_location: true }]]),
    resize_keyboard: true,
})

export const textKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup => ({
    keyboard: (session.form.text ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
})

export const subscribeChannelKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("ready")]
    ],
    resize_keyboard: true,
})

export const ageKeyboard = (session: ISessionData): ReplyKeyboardMarkup | ReplyKeyboardRemove => {
    if (session.form.age) {
        return {
            keyboard: [
                [String(session.form?.age)]
            ],
            resize_keyboard: true,
        }
    } else {
        return {
            remove_keyboard: true
        }
    }
}

export const nameKeyboard = (session: ISessionData): ReplyKeyboardMarkup | ReplyKeyboardRemove => {
    if (session.form.name) {
        return {
            keyboard: ((session.form.previous_name && session.form.previous_name !== session.form.name) ? [[String(session.form?.name)], [String(session.form?.previous_name)]] : [[String(session.form?.name)]]),
            resize_keyboard: true,
        }
    } else {
        return {
            remove_keyboard: true
        }
    }
}