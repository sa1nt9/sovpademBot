import { subscribeChannelKeyboard } from "../constants/keyboards";
import { checkSubscription } from "../functions/checkSubscription";
import { MyContext } from "../typescript/context";

export const checkSubscriptionMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    if (ctx.message?.text?.startsWith('/start') || ctx.session.step === 'choose_language_start') {
        ctx.session.isNeededSubscription = false;
        await next();
        return
    }

    // if (ctx.session.isNeededSubscription) {
    //     await ctx.reply(ctx.t('not_subscribed'), {
    //         reply_markup: subscribeChannelKeyboard(ctx.t),
    //     });
    // }

    const isSubscribed = await checkSubscription(ctx, String(process.env.CHANNEL_NAME));
    if (isSubscribed) {
        if (ctx.session.isNeededSubscription) {
            await ctx.reply(ctx.t('thanks_for_subscription'), {
                reply_markup: {
                    remove_keyboard: true
                },
            });
        }
        ctx.session.isNeededSubscription = false;
        await next();
    } else {
        ctx.session.isNeededSubscription = true;

        await ctx.reply(ctx.t('need_subscription'), {
            reply_markup: subscribeChannelKeyboard(ctx.t),
            parse_mode: "Markdown"
        });
    }
};