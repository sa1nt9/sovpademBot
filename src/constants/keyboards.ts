import { TranslateFunction } from "@grammyjs/i18n"
import { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types"
import { ISessionData } from "../typescript/interfaces/ISessionData"
import { InlineKeyboard } from "grammy"
import { REACTIONS } from "./reaction"
import { ProfileType } from "@prisma/client"
import { IGameProfile, IITProfile, IProfileInfo } from "../typescript/interfaces/IProfile"
import { findKeyByValue, getProfileTypeLocalizations, getSubtypeLocalizations } from "../functions/db/profilesService"


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
    keyboard: (session.activeProfile?.city ? [[`${session.activeProfile?.ownCoordinates ? "📍 " : ""}${session.activeProfile?.city}`], [{ text: t("send_location"), request_location: true }]] : [[{ text: t("send_location"), request_location: true }]]),
    resize_keyboard: true,
})

export const textKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup => ({
    keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : session.activeProfile?.description ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
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
    if (session.activeProfile?.age) {
        return {
            keyboard: [
                [String(session.activeProfile?.age)]
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
    if (session.activeProfile?.name) {
        return {
            keyboard: ((session.activeProfile.previousName && session.activeProfile.previousName !== session.activeProfile.name) ? [[String(session.activeProfile.name)], [String(session.activeProfile.previousName)]] : [[String(session.activeProfile.name)]]),
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
        ["❤️", "💌/📹", "👎", "📋"]
    ],
    resize_keyboard: true,
    is_persistent: true,
})

export const answerLikesFormKeyboard = (): ReplyKeyboardMarkup => ({
    keyboard: [
        ["❤️", "👎", "⚠️", "📋"]
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
        ...Array(6).fill('').map((_, i) => [
            { text: t(`complain_${i + 1}`), callback_data: `complain_reason:${i + 1}:${targetUserId}` }
        ]),
        [
            { text: `↩️ ${t("back")}`, callback_data: `complain_back:${targetUserId}` }
        ]
    ]
})


export const textOrVideoKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("add_private_note")],
        [t("back")]
    ],
    resize_keyboard: true,
})

export const afterNoteYouWantToAddTextToUserKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("add_text_to_user"), t("add_video_to_user")]
    ],
    resize_keyboard: true,
})

export const skipKeyboard = (t: TranslateFunction, withGoBack?: boolean): ReplyKeyboardMarkup => ({
    keyboard: withGoBack ? [
        [t("skip")],
        [t("go_back")]
    ] : [
        [t("skip")]
    ],
    resize_keyboard: true,
})

export const optionsToUserKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        ["1. 🚫", "2. ⚠️", "3. 💤"],
        [t("go_back")]
    ],
    resize_keyboard: true,
})

export const blacklistKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("see_next"), t("blacklist_remove")],
        [t("main_menu")]
    ],
    resize_keyboard: true,
})

export const mainMenuKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("main_menu")]
    ],
    resize_keyboard: true,
})

export const createFormKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("start_using_bot")]
    ],
    resize_keyboard: true,
})

export const createProfileTypeKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("profile_type_relationship")],
        [t("profile_type_sport"), t("profile_type_game")],
        [t("profile_type_hobby"), t("profile_type_it")],
    ],
    resize_keyboard: true,
})

export const createProfileSubtypeKeyboard = (t: TranslateFunction, type: ProfileType): ReplyKeyboardMarkup => ({
    keyboard:
        type === ProfileType.SPORT
            ?
            [
                [t("sport_type_gym"), t("sport_type_running")],
                [t("sport_type_swimming"), t("sport_type_football")],
                [t("sport_type_basketball"), t("sport_type_tennis")],
                [t("sport_type_martial_arts"), t("sport_type_yoga")],
                [t("sport_type_cycling"), t("sport_type_climbing")],
                [t("sport_type_ski_snowboard")]
            ]
            :
            type === ProfileType.IT
                ?
                [
                    [t("it_type_frontend"), t("it_type_backend")],
                    [t("it_type_fullstack"), t("it_type_mobile")],
                    [t("it_type_devops"), t("it_type_qa")],
                    [t("it_type_data_science"), t("it_type_game_dev")],
                    [t("it_type_cybersecurity"), t("it_type_ui_ux")]
                ]
                :
                type === ProfileType.GAME
                    ?
                    [
                        [t("game_type_cs_go"), t("game_type_dota2")],
                        [t("game_type_valorant"), t("game_type_rust")],
                        [t("game_type_minecraft"), t("game_type_league_of_legends")],
                        [t("game_type_fortnite"), t("game_type_pubg")],
                        [t("game_type_gta"), t("game_type_apex_legends")],
                        [t("game_type_fifa"), t("game_type_call_of_duty")],
                        [t("game_type_wow"), t("game_type_genshin_impact")]
                    ]
                    :
                    type === ProfileType.HOBBY
                        ?
                        [
                            [t("hobby_type_music"), t("hobby_type_drawing")],
                            [t("hobby_type_photography"), t("hobby_type_cooking")],
                            [t("hobby_type_crafts"), t("hobby_type_dancing")],
                            [t("hobby_type_reading")]
                        ]
                        :
                        [],
    resize_keyboard: true,
})

export const selectSportLevelkeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("sport_level_beginner"), t("sport_level_intermediate")],
        [t("sport_level_advanced"), t("sport_level_professional")],
    ],
    resize_keyboard: true,
})

export const selectItExperienceKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("it_experience_student"), t("it_experience_junior")],
        [t("it_experience_middle"), t("it_experience_senior")],
        [t("it_experience_lead")],
    ],
    resize_keyboard: true,
})

export const itTechnologiesKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup => ({
    keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : (session.activeProfile as IITProfile)?.technologies ? [[t("leave_current_m")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
})

export const itGithubKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup | ReplyKeyboardRemove => ({
    keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : (session.activeProfile as IITProfile)?.github ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
})

export const gameAccountKeyboard = (t: TranslateFunction, session: ISessionData): ReplyKeyboardMarkup | ReplyKeyboardRemove => ({
    keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : (session.activeProfile as IGameProfile)?.accountLink ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
})

export const switchProfileKeyboard = (t: TranslateFunction, profiles: IProfileInfo[]): ReplyKeyboardMarkup => {
    const localizations = getProfileTypeLocalizations(t)
    const subtypeLocalizations = getSubtypeLocalizations(t)

    return {
        keyboard: [
            ...profiles.map(profile => [`${findKeyByValue(t, profile.profileType, localizations)}${profile.subType ? `: ${findKeyByValue(t, profile.subType, subtypeLocalizations[profile.profileType.toLowerCase() as keyof typeof subtypeLocalizations])}` : ''}`]),
            [t("create_new_profile")],
        ],
        resize_keyboard: true,
    }
}

export const youAlreadyHaveThisProfileKeyboard = (t: TranslateFunction): ReplyKeyboardMarkup => ({
    keyboard: [
        [t("switch_to_this_profile")],
        [t("create_new_profile")],
        [t("main_menu")]
    ],
    resize_keyboard: true,
})


