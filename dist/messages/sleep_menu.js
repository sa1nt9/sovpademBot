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
exports.sleepMenuStep = sleepMenuStep;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const getCandidate_1 = require("../functions/db/getCandidate");
const encodeId_1 = require("../functions/encodeId");
const sendForm_1 = require("../functions/sendForm");
const roulette_start_1 = require("./roulette_start");
function sleepMenuStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === '1🚀') {
            ctx.session.step = 'search_people';
            ctx.session.question = 'years';
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
        else if (message === '2') {
            ctx.session.step = 'profile';
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else if (message === '3') {
            ctx.session.step = 'disable_form';
            yield ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                reply_markup: (0, keyboards_1.disableFormKeyboard)()
            });
        }
        else if (message === '4') {
            ctx.session.step = 'friends';
            const encodedId = (0, encodeId_1.encodeId)(String(ctx.message.from.id));
            const url = `https://t.me/${process.env.BOT_USERNAME}?start=i_${encodedId}`;
            const text = `${ctx.t('invite_link_message', { botname: process.env.CHANNEL_NAME || "" })}`;
            const now = new Date();
            const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            const comeIn14Days = yield postgres_1.prisma.user.count({
                where: {
                    referrerId: String(ctx.message.from.id),
                    createdAt: {
                        gte: fourteenDaysAgo
                    }
                }
            });
            const comeInAll = yield postgres_1.prisma.user.count({
                where: {
                    referrerId: String(ctx.message.from.id)
                }
            });
            const bonus = Math.min(comeIn14Days * 10 + (comeInAll - comeIn14Days) * 5, 100);
            yield ctx.reply(ctx.t('invite_friends_message', { bonus, comeIn14Days, comeInAll }), {
                reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t),
            });
            const inviteLinkText = `${ctx.t('invite_link_message', { botname: process.env.CHANNEL_NAME || "" })}
👉 ${url}`;
            yield ctx.reply(inviteLinkText, {
                reply_markup: (0, keyboards_1.inviteFriendsKeyboard)(ctx.t, url, text),
            });
        }
        else if (message === '5 🎲') {
            ctx.session.step = 'roulette_start';
            yield (0, roulette_start_1.showRouletteStart)(ctx);
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
    });
}
