import { TranslateFunction } from "@grammyjs/i18n"
import { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types"
import { ISessionData } from "../typescript/interfaces/ISessionData"
import { InlineKeyboard } from "grammy"
import { REACTIONS } from "./reaction"


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
            keyboard: [[t("leave_current_m")]],
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
        ["1 🚀", "2", "3", "4", "5 🎲"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const answerFormKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["❤️", "💌/📹", "👎", "💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const answerLikesFormKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["❤️", "👎", "⚠️", "💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const complainToUserKeyboard = (t: TranslateFunction, userId: string): InlineKeyboardMarkup => ({
    inline_keyboard: [
        [
            {
                text: t("complain_to_user"),
                callback_data: `complain:${userId}`
            }
        ]
    ]
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

export const goBackKeyboard = (t: TranslateFunction, go?: boolean): ReplyKeyboardMarkup => ({
    keyboard: [
        [go ? t("go_back") : t("back")]
    ],
    is_persistent: true,
    resize_keyboard: true,
})

export const sendComplainWithoutCommentKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("send_complain_without_comment")],
        [t("back")]
    ],
    resize_keyboard: true,
})


export const inviteFriendsKeyboard = (t: TranslateFunction, url: string, text: string): InlineKeyboardMarkup => ({
    inline_keyboard: [
        [
            {
                text: t("send_telegram_friends"),
                url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
            },
        ],
        [
            {
                text: t("send_whatsapp_friends"),
                url: `https://wa.me/?text=${encodeURIComponent(`${text}
${url}`)}`
            }
        ]
    ],
})

export const somebodysLikedYouKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["1 👍", "2 💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const continueSeeFormsKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("continue_see_forms")]
    ],
    resize_keyboard: true,
})

export const continueKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("continue")]
    ],
    resize_keyboard: true,
})

export const complainKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["1 🔞", "2 💰", "3 📰", "4 ⛔️", "5 💩", "6 🦨", "✖️"]
    ],
    resize_keyboard: true,
})

export const rouletteKeyboard = (t: TranslateFunction, profileRevealed: boolean = false, usernameRevealed: boolean = false): ReplyKeyboardMarkup => {
    const buttons = [];

    // Первый ряд кнопок всегда одинаковый
    buttons.push([t('roulette_next'), t('roulette_stop')]);

    // Второй ряд зависит от статуса раскрытия
    const secondRow = [];
    if (!profileRevealed) {
        secondRow.push(t('roulette_reveal'));
    }
    if (!usernameRevealed) {
        secondRow.push(t("roulette_reveal_username"));
    }

    // Добавляем второй ряд только если в нем есть кнопки
    if (secondRow.length > 0) {
        buttons.push(secondRow);
    }

    return {
        keyboard: buttons,
        resize_keyboard: true,
    };
}

export const rouletteStartKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t('roulette_find')],
        [t("main_menu")]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const rouletteStopKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t('roulette_stop_searching')]
    ],
    resize_keyboard: true,
})


export const confirmRevealKeyboard = (t: TranslateFunction, userId: string, isUsername?: boolean): InlineKeyboardMarkup => ({
    inline_keyboard: [
        [
            {
                text: t(`roulette_reveal_${isUsername ? 'username_' : ''}accept`),
                callback_data: `reveal_${isUsername ? 'username_' : ''}accept:${userId}`
            },
            {
                text: t(`roulette_reveal_${isUsername ? 'username_' : ''}reject`),
                callback_data: `reveal_${isUsername ? 'username_' : ''}reject:${userId}`
            }
        ]
    ]
})

export const rouletteReactionKeyboard = (t: TranslateFunction, partnerId: string = "", counts?: Record<string, number>): InlineKeyboardMarkup => {
    // Создаем двумерный массив кнопок, по 3 кнопки в ряду
    const rows = [];
    const buttonsPerRow = 3;

    for (let i = 0; i < REACTIONS.length; i += buttonsPerRow) {
        const row = REACTIONS.slice(i, i + buttonsPerRow).map(reaction => {
            const count = counts?.[reaction.type] || 0;
            const countDisplay = count > 0 ? ` ${count}` : '';

            return {
                text: `${reaction.emoji}${countDisplay}`,
                callback_data: `reaction:${reaction.type}:${partnerId}`
            };
        });
        rows.push(row);
    }

    rows.push([{ text: t("complain_to_user"), callback_data: `reaction:complain:${partnerId}` }])

    return {
        inline_keyboard: rows
    };
}


export const complainReasonKeyboard = (t: TranslateFunction, targetUserId: string): InlineKeyboardMarkup => ({
    inline_keyboard: [
        [
            { text: t("complain_1"), callback_data: `complain_reason:1:${targetUserId}` }
        ],
        [
            { text: t("complain_2"), callback_data: `complain_reason:2:${targetUserId}` }
        ],
        [
            { text: t("complain_3"), callback_data: `complain_reason:3:${targetUserId}` }
        ],
        [
            { text: t("complain_4"), callback_data: `complain_reason:4:${targetUserId}` }
        ],
        [
            { text: t("complain_5"), callback_data: `complain_reason:5:${targetUserId}` }
        ],
        [
            { text: t("complain_6"), callback_data: `complain_reason:6:${targetUserId}` }
        ],
        [
            { text: `↩️ ${t("back")}`, callback_data: `complain_back:${targetUserId}` }
        ]
    ]
})
