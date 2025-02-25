"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameKeyboard = exports.ageKeyboard = exports.subscribeChannelKeyboard = exports.textKeyboard = exports.cityKeyboard = exports.interestedInKeyboard = exports.genderKeyboard = exports.acceptPrivacyKeyboard = exports.prepareMessageKeyboard = exports.languageKeyboard = void 0;
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
});
exports.prepareMessageKeyboard = prepareMessageKeyboard;
const acceptPrivacyKeyboard = (t) => ({
    keyboard: [
        [t("ok")]
    ],
    resize_keyboard: true,
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
        keyboard: (((_a = session.form) === null || _a === void 0 ? void 0 : _a.city) ? [[`${((_b = session.form) === null || _b === void 0 ? void 0 : _b.myCoordinates) ? "📍 " : ""}${(_c = session.form) === null || _c === void 0 ? void 0 : _c.city}`], [{ text: t("send_location"), request_location: true }]] : [[{ text: t("send_location"), request_location: true }]]),
        resize_keyboard: true,
    });
};
exports.cityKeyboard = cityKeyboard;
const textKeyboard = (t, session) => ({
    keyboard: (session.form.text ? [[t("leave_current")], [t("skip")]] : [[t("skip")]]),
    resize_keyboard: true,
});
exports.textKeyboard = textKeyboard;
const subscribeChannelKeyboard = (t) => ({
    keyboard: [
        [t("ready")]
    ],
    resize_keyboard: true,
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
