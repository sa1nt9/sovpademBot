"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklistCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
const profilesService_1 = require("../functions/db/profilesService");
const blacklistCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    try {
        // Получаем первую запись и общее количество
        const [blacklistedProfile, totalCount] = yield Promise.all([
            postgres_1.prisma.blacklist.findFirst({
                where: { userId },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            postgres_1.prisma.blacklist.count({
                where: { userId }
            })
        ]);
        if (!blacklistedProfile) {
            // Если черный список пуст
            yield ctx.reply(ctx.t('blacklist_empty'));
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
            return;
        }
        ctx.session.step = "blacklist_user";
        yield ctx.reply("🚫📋", {
            reply_markup: (0, keyboards_1.blacklistKeyboard)(ctx.t)
        });
        // Проверяем все возможные типы профилей
        const profile = yield postgres_1.prisma[(0, profilesService_1.getProfileModelName)(blacklistedProfile.profileType)].findUnique({
            where: { id: blacklistedProfile.targetProfileId }
        });
        // Получаем пользователя для этого профиля
        const user = yield postgres_1.prisma.user.findUnique({
            where: { id: profile.userId }
        });
        if (!user) {
            yield ctx.reply(ctx.t('profile_not_found'));
            return;
        }
        // Показываем запись из черного списка
        yield (0, sendForm_1.sendForm)(ctx, user, {
            myForm: false,
            isBlacklist: true,
            blacklistCount: totalCount - 1,
            profileType: blacklistedProfile.profileType,
            subType: blacklistedProfile.subType || ""
        });
        // Сохраняем текущий профиль из черного списка в сессию
        ctx.session.currentBlacklistedProfile = profile;
    }
    catch (error) {
        ctx.logger.error(error, 'Error in blacklist command');
        yield ctx.reply(ctx.t('error_occurred'));
    }
});
exports.blacklistCommand = blacklistCommand;
