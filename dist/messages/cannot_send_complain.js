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
exports.cannotSendComplainStep = cannotSendComplainStep;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const candidatesEnded_1 = require("../functions/candidatesEnded");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
function cannotSendComplainStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield postgres_1.prisma.user.findUnique({
            where: { id: String(ctx.message.from.id) },
        });
        if (existingUser) {
            ctx.session.step = 'search_people';
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
        }
        else {
            if (ctx.session.privacyAccepted) {
                ctx.session.step = "create_profile_type";
                yield ctx.reply(ctx.t('profile_type_title'), {
                    reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
                });
            }
            else {
                ctx.session.step = "accept_privacy";
                yield ctx.reply(ctx.t('privacy_message'), {
                    reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                });
            }
        }
    });
}
