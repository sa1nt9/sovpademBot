"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complainKeyboard = exports.continueSeeFormsKeyboard = exports.somebodysLikedYouKeyboard = exports.inviteFriendsKeyboard = exports.goBackKeyboard = exports.notHaveFormToDeactiveKeyboard = exports.formDisabledKeyboard = exports.disableFormKeyboard = exports.answerLikesFormKeyboard = exports.answerFormKeyboard = exports.profileKeyboard = exports.nameKeyboard = exports.ageKeyboard = exports.subscribeChannelKeyboard = exports.allRightKeyboard = exports.someFilesAddedKeyboard = exports.fileKeyboard = exports.textKeyboard = exports.cityKeyboard = exports.interestedInKeyboard = exports.genderKeyboard = exports.acceptPrivacyKeyboard = exports.prepareMessageKeyboard = exports.languageKeyboard = void 0;
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
        keyboard: (((_a = session.form) === null || _a === void 0 ? void 0 : _a.city) ? [[`${((_b = session.form) === null || _b === void 0 ? void 0 : _b.ownCoordinates) ? "📍 " : ""}${(_c = session.form) === null || _c === void 0 ? void 0 : _c.city}`], [{ text: t("send_location"), request_location: true }]] : [[{ text: t("send_location"), request_location: true }]]),
        resize_keyboard: true,
    });
};
exports.cityKeyboard = cityKeyboard;
const textKeyboard = (t, session) => ({
    keyboard: (session.additionalFormInfo.canGoBack ? [[t('go_back')]] : session.form.text ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
});
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
            keyboard: [[t("leave_current")]],
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
    var _a;
    if (session.form.age) {
        return {
            keyboard: [
                [String((_a = session.form) === null || _a === void 0 ? void 0 : _a.age)]
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
    var _a, _b, _c;
    if (session.form.name) {
        return {
            keyboard: ((session.form.previous_name && session.form.previous_name !== session.form.name) ? [[String((_a = session.form) === null || _a === void 0 ? void 0 : _a.name)], [String((_b = session.form) === null || _b === void 0 ? void 0 : _b.previous_name)]] : [[String((_c = session.form) === null || _c === void 0 ? void 0 : _c.name)]]),
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
        ["1🚀", "2", "3", "4"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.profileKeyboard = profileKeyboard;
const answerFormKeyboard = () => ({
    keyboard: [
        ["❤️", "💌/📹", "👎", "💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.answerFormKeyboard = answerFormKeyboard;
const answerLikesFormKeyboard = () => ({
    keyboard: [
        ["❤️", "👎", "⚠️", "💤"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.answerLikesFormKeyboard = answerLikesFormKeyboard;
const disableFormKeyboard = () => ({
    keyboard: [
        ["1", "2"]
    ],
    resize_keyboard: true,
    is_persistent: true,
});
exports.disableFormKeyboard = disableFormKeyboard;
const formDisabledKeyboard = (t) => ({
    keyboard: [
        [t("search_people")]
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
const complainKeyboard = () => ({
    keyboard: [
        ["1 🔞", "2 💰", "3 💩", "4 🦨", "9"]
    ],
    resize_keyboard: true,
});
exports.complainKeyboard = complainKeyboard;
