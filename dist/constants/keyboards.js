"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityKeyboard = exports.interestedInKeyboard = exports.genderKeyboard = exports.acceptPrivacyKeyboard = exports.languageKeyboard = void 0;
exports.languageKeyboard = {
    keyboard: [
        ['🇷🇺 Русский', '🇬🇧 English', '🇺🇦 Українська'],
        ['🇰🇿 Қазақша', '🇮🇩 Indonesia', '🇪🇸 Español'],
        ['🇵🇱 Polski', '🇮🇳 हिंदी', '🇮🇹 Italiano'],
        ['🇫🇷 Français', '🇩🇪 Deutsch', '🇧🇷 Português'],
    ],
    resize_keyboard: true,
};
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
const cityKeyboard = (t) => ({
    keyboard: [
        [{ text: t("send_location"), request_location: true }]
    ],
    resize_keyboard: true,
});
exports.cityKeyboard = cityKeyboard;
