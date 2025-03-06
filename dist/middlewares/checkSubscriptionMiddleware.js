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
exports.checkSubscriptionMiddleware = void 0;
const keyboards_1 = require("../constants/keyboards");
const checkSubscription_1 = require("../functions/checkSubscription");
const checkSubscriptionMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.startsWith('/start')) || ctx.session.step === 'choose_language_start') {
        ctx.session.isNeededSubscription = false;
        yield next();
        return;
    }
    // if (ctx.session.isNeededSubscription) {
    //     await ctx.reply(ctx.t('not_subscribed'), {
    //         reply_markup: subscribeChannelKeyboard(ctx.t),
    //     });
    // }
    const isSubscribed = yield (0, checkSubscription_1.checkSubscription)(ctx, String(process.env.CHANNEL_NAME));
    if (isSubscribed) {
        if (ctx.session.isNeededSubscription) {
            yield ctx.reply(ctx.t('thanks_for_subscription'), {
                reply_markup: {
                    remove_keyboard: true
                },
            });
        }
        ctx.session.isNeededSubscription = false;
        yield next();
    }
    else {
        ctx.session.isNeededSubscription = true;
        yield ctx.reply(ctx.t('need_subscription'), {
            reply_markup: (0, keyboards_1.subscribeChannelKeyboard)(ctx.t),
            parse_mode: "Markdown"
        });
    }
});
exports.checkSubscriptionMiddleware = checkSubscriptionMiddleware;
