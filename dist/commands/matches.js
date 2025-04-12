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
exports.matchesCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const grammy_1 = require("grammy");
const formatDate_1 = require("../functions/formatDate");
const client_1 = require("@prisma/client");
const profilesService_1 = require("../functions/db/profilesService");
const matchesCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({ userId }, 'Starting matches command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.session.step = 'sleep_menu';
        // Определяем текущий тип профиля из сессии
        const profileType = ctx.session.activeProfile.profileType || client_1.ProfileType.RELATIONSHIP;
        // Получаем модель для типа профиля
        const profileModel = (0, profilesService_1.getProfileModelName)(profileType);
        // Получаем ID активного профиля на основе типа профиля
        const profile = yield postgres_1.prisma[profileModel].findFirst({
            where: { userId }
        });
        const activeProfileId = (profile === null || profile === void 0 ? void 0 : profile.id) || "";
        if (!activeProfileId) {
            ctx.logger.warn({ userId }, 'No active profile found');
            yield ctx.reply(ctx.t('no_active_profile'));
            return;
        }
        // Получаем все взаимные симпатии для активного профиля
        const mutualLikes = yield postgres_1.prisma.profileLike.findMany({
            where: {
                fromProfileId: activeProfileId,
                liked: true,
                isMutual: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 101
        });
        if (mutualLikes.length === 0) {
            ctx.session.step = 'form_disabled';
            ctx.logger.info({ userId }, 'No matches found');
            yield ctx.reply(ctx.t('no_matches'), {
                reply_markup: (0, keyboards_1.formDisabledKeyboard)(ctx.t)
            });
            return;
        }
        ctx.logger.info({
            userId,
            matchesCount: mutualLikes.length
        }, 'Found matches');
        let message = mutualLikes.length > 100 ? ctx.t('matches_message_last') : ctx.t('matches_message_all') + '\n\n';
        // Создаем inline клавиатуру с номерами
        const keyboard = new grammy_1.InlineKeyboard();
        const buttonsPerRow = 5;
        for (let i = 0; i < mutualLikes.length; i++) {
            const like = mutualLikes[i];
            // Получаем модель для целевого профиля
            const targetProfileModel = (0, profilesService_1.getProfileModelName)(like.profileType);
            // Получаем данные пользователя на основе ID профиля
            try {
                // Находим профиль пользователя с включением данных о пользователе
                const targetProfile = yield postgres_1.prisma[targetProfileModel].findUnique({
                    where: { id: like.toProfileId },
                    include: { user: true }
                });
                if (!targetProfile || !targetProfile.user)
                    continue;
                const targetUserId = targetProfile.user.id;
                const targetName = targetProfile.user.name;
                const userInfo = yield ctx.api.getChat(targetUserId);
                const username = userInfo.username ? `https://t.me/${userInfo.username}` : "";
                message += `${i + 1}. [${targetName}](${username}) - ${(0, formatDate_1.formatDate)(like.isMutualAt || like.createdAt)}, ${ctx.t(`profile_type_${like.profileType.toLowerCase()}`)}\n`;
                if (i % buttonsPerRow === 0 && i !== 0) {
                    keyboard.row();
                }
                keyboard.text(`${i + 1}. ${targetName}, ${ctx.t(`profile_type_${like.profileType.toLowerCase()}`)}`, `match:${targetUserId}`);
            }
            catch (e) {
                ctx.logger.error({
                    userId,
                    targetProfileId: like.toProfileId,
                    error: e instanceof Error ? e.message : 'Unknown error'
                }, 'Error retrieving profile or chat data');
                continue;
            }
        }
        message += `\n${ctx.t('matches_message_choose')}`;
        yield ctx.reply(message, {
            parse_mode: 'Markdown',
            link_preview_options: {
                is_disabled: true
            },
            reply_markup: keyboard
        });
        yield ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        ctx.session.step = "you_dont_have_form";
        ctx.logger.warn({ userId }, 'User tried to view matches without profile');
        yield ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
        });
    }
});
exports.matchesCommand = matchesCommand;
