"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateProfileKeyboard = exports.youAlreadyHaveThisProfileKeyboard = exports.switchProfileKeyboard = exports.gameAccountKeyboard = exports.itGithubKeyboard = exports.itTechnologiesKeyboard = exports.selectItExperienceKeyboard = exports.selectSportLevelkeyboard = exports.createProfileSubtypeKeyboard = exports.createProfileTypeKeyboard = exports.createFormKeyboard = exports.mainMenuKeyboard = exports.blacklistKeyboard = exports.optionsToUserKeyboard = exports.skipKeyboard = exports.afterNoteYouWantToAddTextToUserKeyboard = exports.textOrVideoKeyboard = exports.complainReasonKeyboard = exports.rouletteReactionKeyboard = exports.confirmRevealKeyboard = exports.rouletteStopKeyboard = exports.rouletteStartKeyboard = exports.rouletteKeyboard = exports.complainKeyboard = exports.continueKeyboard = exports.continueSeeFormsKeyboard = exports.somebodysLikedYouKeyboard = exports.inviteFriendsKeyboard = exports.sendComplainWithoutCommentKeyboard = exports.goBackKeyboard = exports.notHaveFormToDeactiveKeyboard = exports.formDisabledKeyboard = exports.complainToUserKeyboard = exports.answerLikesFormKeyboard = exports.answerFormKeyboard = exports.profileKeyboard = exports.nameKeyboard = exports.ageKeyboard = exports.subscribeChannelKeyboard = exports.allRightKeyboard = exports.someFilesAddedKeyboard = exports.fileKeyboard = exports.textKeyboard = exports.cityKeyboard = exports.interestedInKeyboard = exports.genderKeyboard = exports.acceptPrivacyKeyboard = exports.prepareMessageKeyboard = exports.languageKeyboard = void 0;
const reaction_1 = require("./reaction");
const client_1 = require("@prisma/client");
const profilesService_1 = require("../functions/db/profilesService");
exports.languageKeyboard = {
    keyboard: [
        ['🇷🇺 Русский', '🇬🇧 English', '🇺🇦 Українська'],
        ['🇰🇿 Қазақша', '🇮🇩 Indonesia', '🇪🇸 Español'],
        ['🇵🇱 Polski', '🇮🇳 हिंदी', '🇮🇹 Italiano'],
        ['🇫🇷 Français', '🇩🇪 Deutsch', '🇧🇷 Português'],
    ],
    resize_keyboard: true,
};
const prepareMessageKeyboard = (t) => ({
    keyboard: [[t("ok_lets_start")]],
    resize_keyboard: true,
    is_persistent: true,
});
exports.prepareMessageKeyboard = prepareMessageKeyboard;
const acceptPrivacyKeyboard = (t) => ({
    keyboard: [
        [t("ok")]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.acceptPrivacyKeyboard = acceptPrivacyKeyboard;
const genderKeyboard = (t) => ({
    keyboard: [
        [t('i_woman'), t('i_man')]
    ],
    resize_keyboard: true,
});
exports.genderKeyboard = genderKeyboard;
const interestedInKeyboard = (t) => ({
    keyboard: [
        [t('women'), t('men'), t("not_matter")]
    ],
    resize_keyboard: true,
});
exports.interestedInKeyboard = interestedInKeyboard;
const cityKeyboard = (t, session) => {
    var _a, _b, _c;
    return ({
        keyboard: (((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.city) ? [[`${((_b = session.activeProfile) === null || _b === void 0 ? void 0 : _b.ownCoordinates) ? "📍 " : ""}${(_c = session.activeProfile) === null || _c === void 0 ? void 0 : _c.city}`], [{ text: t("send_location"), request_location: true }]] : [[{ text: t("send_location"), request_location: true }]]),
        resize_keyboard: true,
    });
};
exports.cityKeyboard = cityKeyboard;
const textKeyboard = (t, session) => {
    var _a;
    return ({
        keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : ((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.description) ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
        resize_keyboard: true,
    });
};
exports.textKeyboard = textKeyboard;
const fileKeyboard = (t, session, canLeaveCurrent) => {
    if (session.additionalFormInfo.canGoBack) {
        return {
            keyboard: [[t("go_back")]],
            resize_keyboard: true,
        };
    }
    else if (canLeaveCurrent) {
        return {
            keyboard: [[t("leave_current_m")]],
            resize_keyboard: true,
        };
    }
    else {
        return {
            remove_keyboard: true
        };
    }
};
exports.fileKeyboard = fileKeyboard;
const someFilesAddedKeyboard = (t, session) => ({
    keyboard: session.additionalFormInfo.canGoBack
        ?
            [
                [t("go_back")],
                [t("its_all_save_files")]
            ]
        :
            [
                [t("its_all_save_files")]
            ],
    resize_keyboard: true,
});
exports.someFilesAddedKeyboard = someFilesAddedKeyboard;
const allRightKeyboard = (t) => ({
    keyboard: [
        [t("yes"), t("change_form")]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.allRightKeyboard = allRightKeyboard;
const subscribeChannelKeyboard = (t) => ({
    keyboard: [
        [t("ready")]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.subscribeChannelKeyboard = subscribeChannelKeyboard;
const ageKeyboard = (session) => {
    var _a, _b;
    if ((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.age) {
        return {
            keyboard: [
                [String((_b = session.activeProfile) === null || _b === void 0 ? void 0 : _b.age)]
            ],
            resize_keyboard: true,
        };
    }
    else {
        return {
            remove_keyboard: true
        };
    }
};
exports.ageKeyboard = ageKeyboard;
const nameKeyboard = (session) => {
    var _a;
    if ((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.name) {
        return {
            keyboard: ((session.activeProfile.previousName && session.activeProfile.previousName !== session.activeProfile.name) ? [[String(session.activeProfile.name)], [String(session.activeProfile.previousName)]] : [[String(session.activeProfile.name)]]),
            resize_keyboard: true,
        };
    }
    else {
        return {
            remove_keyboard: true
        };
    }
};
exports.nameKeyboard = nameKeyboard;
const profileKeyboard = () => ({
    keyboard: [
        ["1 🚀", "2", "3"],
        ["4", "5", "6 🎲"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.profileKeyboard = profileKeyboard;
const answerFormKeyboard = () => ({
    keyboard: [
        ["❤️", "💌/📹", "👎", "📋"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.answerFormKeyboard = answerFormKeyboard;
const answerLikesFormKeyboard = () => ({
    keyboard: [
        ["❤️", "👎", "⚠️", "📋"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.answerLikesFormKeyboard = answerLikesFormKeyboard;
const complainToUserKeyboard = (t, userId) => ({
    inline_keyboard: [
        [
            {
                text: t("complain_to_user"),
                callback_data: `complain:${userId}`
            }
        ]
    ]
});
exports.complainToUserKeyboard = complainToUserKeyboard;
// export const disableFormKeyboard = (): ReplyKeyboardMarkup => ({
//     keyboard: [
//         ["1", "2"]
//     ],
//     resize_keyboard: true,
//     is_persistent: true,
// })
const formDisabledKeyboard = (t) => ({
    keyboard: [
        [t("main_menu")],
        [t("create_new_profile")]
    ],
    is_persistent: true,
    resize_keyboard: true,
});
exports.formDisabledKeyboard = formDisabledKeyboard;
const notHaveFormToDeactiveKeyboard = (t) => ({
    keyboard: [
        [t("create_form")]
    ],
    is_persistent: true,
    resize_keyboard: true,
});
exports.notHaveFormToDeactiveKeyboard = notHaveFormToDeactiveKeyboard;
const goBackKeyboard = (t, go) => ({
    keyboard: [
        [go ? t("go_back") : t("back")]
    ],
    is_persistent: true,
    resize_keyboard: true,
});
exports.goBackKeyboard = goBackKeyboard;
const sendComplainWithoutCommentKeyboard = (t) => ({
    keyboard: [
        [t("send_complain_without_comment")],
        [t("back")]
    ],
    resize_keyboard: true,
});
exports.sendComplainWithoutCommentKeyboard = sendComplainWithoutCommentKeyboard;
const inviteFriendsKeyboard = (t, url, text) => ({
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
});
exports.inviteFriendsKeyboard = inviteFriendsKeyboard;
const somebodysLikedYouKeyboard = () => ({
    keyboard: [
        ["1 👍", "2 💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.somebodysLikedYouKeyboard = somebodysLikedYouKeyboard;
const continueSeeFormsKeyboard = (t) => ({
    keyboard: [
        [t("continue_see_forms")]
    ],
    resize_keyboard: true,
});
exports.continueSeeFormsKeyboard = continueSeeFormsKeyboard;
const continueKeyboard = (t) => ({
    keyboard: [
        [t("continue")]
    ],
    resize_keyboard: true,
});
exports.continueKeyboard = continueKeyboard;
const complainKeyboard = () => ({
    keyboard: [
        ["1 🔞", "2 💰", "3 📰", "4 ⛔️", "5 💩", "6 🦨", "✖️"]
    ],
    resize_keyboard: true,
});
exports.complainKeyboard = complainKeyboard;
const rouletteKeyboard = (t, profileRevealed = false, usernameRevealed = false) => {
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
};
exports.rouletteKeyboard = rouletteKeyboard;
const rouletteStartKeyboard = (t) => ({
    keyboard: [
        [t('roulette_find')],
        [t("main_menu")]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.rouletteStartKeyboard = rouletteStartKeyboard;
const rouletteStopKeyboard = (t) => ({
    keyboard: [
        [t('roulette_stop_searching')]
    ],
    resize_keyboard: true,
});
exports.rouletteStopKeyboard = rouletteStopKeyboard;
const confirmRevealKeyboard = (t, userId, isUsername) => ({
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
});
exports.confirmRevealKeyboard = confirmRevealKeyboard;
const rouletteReactionKeyboard = (t, partnerId = "", counts) => {
    // Создаем двумерный массив кнопок, по 3 кнопки в ряду
    const rows = [];
    const buttonsPerRow = 3;
    for (let i = 0; i < reaction_1.REACTIONS.length; i += buttonsPerRow) {
        const row = reaction_1.REACTIONS.slice(i, i + buttonsPerRow).map(reaction => {
            const count = (counts === null || counts === void 0 ? void 0 : counts[reaction.type]) || 0;
            const countDisplay = count > 0 ? ` ${count}` : '';
            return {
                text: `${reaction.emoji}${countDisplay}`,
                callback_data: `reaction:${reaction.type}:${partnerId}`
            };
        });
        rows.push(row);
    }
    rows.push([{ text: t("complain_to_user"), callback_data: `reaction:complain:${partnerId}` }]);
    return {
        inline_keyboard: rows
    };
};
exports.rouletteReactionKeyboard = rouletteReactionKeyboard;
const complainReasonKeyboard = (t, targetUserId) => ({
    inline_keyboard: [
        ...Array(6).fill('').map((_, i) => [
            { text: t(`complain_${i + 1}`), callback_data: `complain_reason:${i + 1}:${targetUserId}` }
        ]),
        [
            { text: `↩️ ${t("back")}`, callback_data: `complain_back:${targetUserId}` }
        ]
    ]
});
exports.complainReasonKeyboard = complainReasonKeyboard;
const textOrVideoKeyboard = (t) => ({
    keyboard: [
        [t("add_private_note")],
        [t("back")]
    ],
    resize_keyboard: true,
});
exports.textOrVideoKeyboard = textOrVideoKeyboard;
const afterNoteYouWantToAddTextToUserKeyboard = (t) => ({
    keyboard: [
        [t("add_text_to_user"), t("add_video_to_user")]
    ],
    resize_keyboard: true,
});
exports.afterNoteYouWantToAddTextToUserKeyboard = afterNoteYouWantToAddTextToUserKeyboard;
const skipKeyboard = (t, withGoBack) => ({
    keyboard: withGoBack ? [
        [t("skip")],
        [t("go_back")]
    ] : [
        [t("skip")]
    ],
    resize_keyboard: true,
});
exports.skipKeyboard = skipKeyboard;
const optionsToUserKeyboard = (t) => ({
    keyboard: [
        ["1. 🚫", "2. ⚠️", "3. 💤"],
        [t("go_back")]
    ],
    resize_keyboard: true,
});
exports.optionsToUserKeyboard = optionsToUserKeyboard;
const blacklistKeyboard = (t) => ({
    keyboard: [
        [t("see_next"), t("blacklist_remove")],
        [t("main_menu")]
    ],
    resize_keyboard: true,
});
exports.blacklistKeyboard = blacklistKeyboard;
const mainMenuKeyboard = (t) => ({
    keyboard: [
        [t("main_menu")]
    ],
    resize_keyboard: true,
});
exports.mainMenuKeyboard = mainMenuKeyboard;
const createFormKeyboard = (t) => ({
    keyboard: [
        [t("start_using_bot")]
    ],
    resize_keyboard: true,
});
exports.createFormKeyboard = createFormKeyboard;
const createProfileTypeKeyboard = (t) => ({
    keyboard: [
        [t("profile_type_relationship")],
        [t("profile_type_sport"), t("profile_type_game")],
        [t("profile_type_hobby"), t("profile_type_it")],
    ],
    resize_keyboard: true,
});
exports.createProfileTypeKeyboard = createProfileTypeKeyboard;
const createProfileSubtypeKeyboard = (t, type) => ({
    keyboard: type === client_1.ProfileType.SPORT
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
            type === client_1.ProfileType.IT
                ?
                    [
                        [t("it_type_frontend"), t("it_type_backend")],
                        [t("it_type_fullstack"), t("it_type_mobile")],
                        [t("it_type_devops"), t("it_type_qa")],
                        [t("it_type_data_science"), t("it_type_game_dev")],
                        [t("it_type_cybersecurity"), t("it_type_ui_ux")]
                    ]
                :
                    type === client_1.ProfileType.GAME
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
                            type === client_1.ProfileType.HOBBY
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
});
exports.createProfileSubtypeKeyboard = createProfileSubtypeKeyboard;
const selectSportLevelkeyboard = (t) => ({
    keyboard: [
        [t("sport_level_beginner"), t("sport_level_intermediate")],
        [t("sport_level_advanced"), t("sport_level_professional")],
    ],
    resize_keyboard: true,
});
exports.selectSportLevelkeyboard = selectSportLevelkeyboard;
const selectItExperienceKeyboard = (t) => ({
    keyboard: [
        [t("it_experience_student"), t("it_experience_junior")],
        [t("it_experience_middle"), t("it_experience_senior")],
        [t("it_experience_lead")],
    ],
    resize_keyboard: true,
});
exports.selectItExperienceKeyboard = selectItExperienceKeyboard;
const itTechnologiesKeyboard = (t, session) => {
    var _a;
    return ({
        keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : ((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.technologies) ? [[t("leave_current_m")], [t("skip")]] : [[t("skip")]]),
        resize_keyboard: true,
    });
};
exports.itTechnologiesKeyboard = itTechnologiesKeyboard;
const itGithubKeyboard = (t, session) => {
    var _a;
    return ({
        keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : ((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.github) ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
        resize_keyboard: true,
    });
};
exports.itGithubKeyboard = itGithubKeyboard;
const gameAccountKeyboard = (t, session) => {
    var _a;
    return ({
        keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : ((_a = session.activeProfile) === null || _a === void 0 ? void 0 : _a.accountLink) ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
        resize_keyboard: true,
    });
};
exports.gameAccountKeyboard = gameAccountKeyboard;
const switchProfileKeyboard = (t, profiles) => {
    const localizations = (0, profilesService_1.getProfileTypeLocalizations)(t);
    const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(t);
    return {
        keyboard: [
            [t("go_back")],
            ...profiles.map(profile => [`${(0, profilesService_1.findKeyByValue)(t, profile.profileType, localizations)}${profile.subType ? `: ${(0, profilesService_1.findKeyByValue)(t, profile.subType, subtypeLocalizations[profile.profileType.toLowerCase()])}` : ''}`]),
            [t("create_new_profile")],
        ],
        resize_keyboard: true,
    };
};
exports.switchProfileKeyboard = switchProfileKeyboard;
const youAlreadyHaveThisProfileKeyboard = (t) => ({
    keyboard: [
        [t("switch_to_this_profile")],
        [t("create_new_profile")],
        [t("main_menu")]
    ],
    resize_keyboard: true,
});
exports.youAlreadyHaveThisProfileKeyboard = youAlreadyHaveThisProfileKeyboard;
const deactivateProfileKeyboard = (t, profiles) => {
    const localizations = (0, profilesService_1.getProfileTypeLocalizations)(t);
    const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(t);
    return {
        keyboard: [
            [t("go_back")],
            ...profiles.map(profile => [`${(0, profilesService_1.findKeyByValue)(t, profile.profileType, localizations)}${profile.subType ? `: ${(0, profilesService_1.findKeyByValue)(t, profile.subType, subtypeLocalizations[profile.profileType.toLowerCase()])}` : ''}`]),
            [t("disable_all_profiles")]
        ],
        resize_keyboard: true,
    };
};
exports.deactivateProfileKeyboard = deactivateProfileKeyboard;
