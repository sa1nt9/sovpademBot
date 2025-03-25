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
const getNextBlacklistUser_1 = require("../functions/db/getNextBlacklistUser");
const sendForm_1 = require("../functions/sendForm");
function blacklistUserStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        if (message === ctx.t('main_menu')) {
            ctx.session.step = "profile";
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else if (message === ctx.t("see_next")) {
            if (!ctx.session.currentBlacklistedUser) {
                yield ctx.reply(ctx.t("error_occurred"));
                return;
            }
            const nextUser = yield (0, getNextBlacklistUser_1.getNextBlacklistUser)(ctx, ctx.session.currentBlacklistedUser.id);
            if (nextUser.user) {
                ctx.session.currentBlacklistedUser = nextUser.user;
                yield (0, sendForm_1.sendForm)(ctx, nextUser.user, {
                    myForm: false,
                    isBlacklist: true,
                    blacklistCount: nextUser.remainingCount
                });
            }
            else {
                yield ctx.reply(ctx.t('blacklist_no_more_users'));
                ctx.session.step = "sleep_menu";
                ctx.session.currentBlacklistedUser = null;
                yield ctx.reply(ctx.t('sleep_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
        }
        else if (message === ctx.t("blacklist_remove")) {
            if (!ctx.session.currentBlacklistedUser) {
                yield ctx.reply(ctx.t("error_occurred"));
                return;
            }
            try {
                const result = yield (0, getNextBlacklistUser_1.getNextBlacklistUser)(ctx, ctx.session.currentBlacklistedUser.id);
                yield postgres_1.prisma.blacklist.deleteMany({
                    where: {
                        userId: String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id),
                        targetId: ctx.session.currentBlacklistedUser.id
                    }
                });
                yield ctx.reply(ctx.t("blacklist_remove_success"));
                if (result.user) {
                    ctx.session.currentBlacklistedUser = result.user;
                    yield (0, sendForm_1.sendForm)(ctx, result.user, {
                        myForm: false,
                        isBlacklist: true,
                        blacklistCount: result.remainingCount - 1
                    });
                }
                else {
                    yield ctx.reply(ctx.t('blacklist_no_more_users'));
                    ctx.session.step = "sleep_menu";
                    ctx.session.currentBlacklistedUser = null;
                    yield ctx.reply(ctx.t("sleep_menu"), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
            }
            catch (error) {
                console.error("Error removing user from blacklist:", error);
                yield ctx.reply(ctx.t("blacklist_remove_error"));
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.blacklistKeyboard)(ctx.t)
            });
        }
    });
}
