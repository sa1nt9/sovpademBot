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
exports.blacklistUserStep = blacklistUserStep;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const getNextBlacklistProfile_1 = require("../functions/db/getNextBlacklistProfile");
const sendForm_1 = require("../functions/sendForm");
function blacklistUserStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        ctx.logger.info({ userId }, 'User in blacklist management menu');
        if (message === ctx.t('main_menu')) {
            ctx.logger.info({ userId }, 'User returning to main menu from blacklist');
            ctx.session.step = "profile";
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else if (message === ctx.t("see_next")) {
            if (!ctx.session.currentBlacklistedProfile) {
                ctx.logger.warn({ userId }, 'User tried to see next blacklist profile but no current profile was found');
                yield ctx.reply(ctx.t("error_occurred"));
                return;
            }
            const currentProfileId = ctx.session.currentBlacklistedProfile.id;
            ctx.logger.info({ userId, currentBlacklistedProfileId: currentProfileId }, 'User requesting next blacklisted profile');
            const nextProfile = yield (0, getNextBlacklistProfile_1.getNextBlacklistProfile)(ctx, currentProfileId);
            if (nextProfile.profile && nextProfile.profile.user) {
                const nextProfileId = nextProfile.profile.id;
                const nextProfileUserId = nextProfile.profile.user.id;
                ctx.logger.info({
                    userId,
                    nextProfileId,
                    nextProfileUserId,
                    remainingCount: nextProfile.remainingCount
                }, 'Found next blacklisted profile');
                ctx.session.currentBlacklistedProfile = nextProfile.profile;
                yield (0, sendForm_1.sendForm)(ctx, nextProfile.profile.user, {
                    myForm: false,
                    isBlacklist: true,
                    blacklistCount: nextProfile.remainingCount
                });
            }
            else {
                ctx.logger.info({ userId }, 'No more blacklisted profiles available');
                yield ctx.reply(ctx.t('blacklist_no_more_users'));
                ctx.session.step = "sleep_menu";
                ctx.session.currentBlacklistedProfile = null;
                yield ctx.reply(ctx.t('sleep_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
        }
        else if (message === ctx.t("blacklist_remove")) {
            if (!ctx.session.currentBlacklistedProfile) {
                ctx.logger.warn({ userId }, 'User tried to remove profile from blacklist but no current profile was found');
                yield ctx.reply(ctx.t("error_occurred"));
                return;
            }
            const profileToRemoveId = ctx.session.currentBlacklistedProfile.id;
            ctx.logger.info({ userId, profileToRemoveId }, 'Removing profile from blacklist');
            try {
                const result = yield (0, getNextBlacklistProfile_1.getNextBlacklistProfile)(ctx, profileToRemoveId);
                yield postgres_1.prisma.blacklist.deleteMany({
                    where: {
                        userId,
                        targetProfileId: profileToRemoveId
                    }
                });
                ctx.logger.info({ userId, profileToRemoveId }, 'Successfully removed profile from blacklist');
                yield ctx.reply(ctx.t("blacklist_remove_success"));
                if (result.profile && result.profile.user) {
                    const nextProfileId = result.profile.id;
                    ctx.logger.info({
                        userId,
                        nextProfileId,
                        remainingCount: result.remainingCount - 1
                    }, 'Showing next blacklisted profile after removal');
                    ctx.session.currentBlacklistedProfile = result.profile;
                    yield (0, sendForm_1.sendForm)(ctx, result.profile.user, {
                        myForm: false,
                        isBlacklist: true,
                        blacklistCount: result.remainingCount - 1
                    });
                }
                else {
                    ctx.logger.info({ userId }, 'No more blacklisted profiles after removal');
                    yield ctx.reply(ctx.t('blacklist_no_more_users'));
                    ctx.session.step = "sleep_menu";
                    ctx.session.currentBlacklistedProfile = null;
                    yield ctx.reply(ctx.t("sleep_menu"), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
            }
            catch (error) {
                ctx.logger.error({ userId, error, profileId: profileToRemoveId }, 'Error removing profile from blacklist');
                console.error("Error removing user from blacklist:", error);
                yield ctx.reply(ctx.t("blacklist_remove_error"));
            }
        }
        else {
            ctx.logger.warn({ userId, message }, 'User sent unexpected message in blacklist menu');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.blacklistKeyboard)(ctx.t)
            });
        }
    });
}
