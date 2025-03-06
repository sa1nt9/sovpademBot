import { TranslateFunction } from "@grammyjs/i18n"
import { ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types"
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
    is_persistent: true,
})

export const acceptPrivacyKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("ok")]
    ],
    resize_keyboard: true,
    is_persistent: true,
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
    keyboard: (session.form?.city ? [[`${session.form?.ownCoordinates ? "📍 " : ""}${session.form?.city}`], [{ text: t("send_location"), request_location: true }]] : [[{ text: t("send_location"), request_location: true }]]),
    resize_keyboard: true,
})

export const textKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup => ({
    keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : session.form.text ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
})

export const fileKeyboard = (t: TranslateFunction, session: ISessionData, canLeaveCurrent: boolean): ReplyKeyboardMarkup | ReplyKeyboardRemove => {
    if (session.additionalFormInfo.canGoBack) {
        return {
            keyboard: [[t("go_back")]],
            resize_keyboard: true,
        }
    } else if (canLeaveCurrent) {
        return {
            keyboard: [[t("leave_current")]],
            resize_keyboard: true,
        }
    } else {
        return {
            remove_keyboard: true
        }
    }
}

export const someFilesAddedKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup => ({
    keyboard: session.additionalFormInfo.canGoBack
        ?
        [
            [t("go_back")],
            [t("its_all_save_files")]
        ]
        :
        [
            [t("its_all_save_files")]
        ]
    ,
    resize_keyboard: true,
})

export const allRightKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("yes"), t("change_form")]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const subscribeChannelKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("ready")]
    ],
    resize_keyboard: true,
    is_persistent: true,
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

export const profileKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["1🚀", "2", "3", "4"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const answerFormKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["♥️", "💌/📹", "👎", "💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const disableFormKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["1", "2"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const formDisabledKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("search_people")]
    ],
    is_persistent: true,
    resize_keyboard: true,
})

export const notHaveFormToDeactiveKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("create_form")]
    ],
    is_persistent: true,
    resize_keyboard: true,
})

export const goBackKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("back")]
    ],
    is_persistent: true,
    resize_keyboard: true,
})

