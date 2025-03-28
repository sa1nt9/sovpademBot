"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = void 0;
const i18n_1 = require("@grammyjs/i18n");
const i18n = (isInlineQuery = false) => {
    return new i18n_1.I18n({
        defaultLocale: "ru",
        directory: "locales",
        useSession: !isInlineQuery,
    });
};
exports.i18n = i18n;
