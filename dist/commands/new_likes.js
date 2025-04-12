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
exports.newLikesCommand = void 0;
const keyboards_1 = require("./../constants/keyboards");
const postgres_1 = require("../db/postgres");
const getOneLike_1 = require("../functions/db/getOneLike");
const sendForm_1 = require("../functions/sendForm");
const newLikesCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({ userId }, 'Starting new likes command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        const oneLike = yield (0, getOneLike_1.getOneLike)(userId, 'user');
        if (oneLike) {
            ctx.logger.info({ userId, fromProfileId: (_b = oneLike.fromProfile) === null || _b === void 0 ? void 0 : _b.id }, 'Found new like');
            ctx.session.step = 'search_people_with_likes';
            ctx.session.additionalFormInfo.searchingLikes = true;
            ctx.session.currentCandidateProfile = oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile;
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerLikesFormKeyboard)()
            });
            if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile) {
                yield (0, sendForm_1.sendForm)(ctx, oneLike.fromProfile.user, { myForm: false, like: oneLike });
            }
        }
        else {
            ctx.logger.info({ userId }, 'No new likes found');
            yield ctx.reply(ctx.t('no_new_likes'), {
                reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
            });
            ctx.session.step = 'sleep_menu';
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
    }
    else {
        ctx.session.step = "you_dont_have_form";
        ctx.logger.warn({ userId }, 'User tried to check likes without profile');
        yield ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
        });
    }
});
exports.newLikesCommand = newLikesCommand;
