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
exports.youDontHaveFormStep = youDontHaveFormStep;
const keyboards_1 = require("../constants/keyboards");
function youDontHaveFormStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        const userId = String(ctx.from.id);
        ctx.logger.info({ userId, step: 'you_dont_have_form' }, 'User trying to use feature without having a profile');
        if (message === ctx.t('create_form')) {
            ctx.logger.info({ userId }, 'User decided to create profile');
            if (ctx.session.privacyAccepted) {
                ctx.logger.info({ userId, privacyAccepted: true }, 'Privacy already accepted, proceeding to profile type selection');
                ctx.session.step = "create_profile_type";
                ctx.session.isCreatingProfile = true;
                yield ctx.reply(ctx.t('profile_type_title'), {
                    reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
                });
            }
            else {
                ctx.logger.info({ userId, privacyAccepted: false }, 'Privacy not accepted, redirecting to privacy agreement');
                ctx.session.step = "accept_privacy";
                yield ctx.reply(ctx.t('privacy_message'), {
                    reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                });
            }
        }
        else {
            ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response on no-form screen');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
            });
        }
    });
}
