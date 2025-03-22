import { myprofileCommand } from "../commands/myprofile";
import { prepareMessageKeyboard, subscribeChannelKeyboard } from "../constants/keyboards";
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

    const isSubscribed = await checkSubscription(ctx, String(process.env.CHANNEL_USERNAME));
    if (isSubscribed) {
        if (ctx.session.isNeededSubscription) {
            ctx.session.isNeededSubscription = false;
            await ctx.reply(ctx.t('thanks_for_subscription'), {
                reply_markup: {
                    remove_keyboard: true
                },
            });
            if (ctx.session.step === 'prepare_message') {
                await ctx.reply(ctx.t('lets_start'), {
                    reply_markup: prepareMessageKeyboard(ctx.t),
                });
            } else {
                await myprofileCommand(ctx)
            }
        } else {
            await next();
        }
    } else {
        ctx.session.isNeededSubscription = true;

        await ctx.reply(ctx.t('need_subscription', { botname: process.env.CHANNEL_NAME || "" }), {
            reply_markup: subscribeChannelKeyboard(ctx.t),
            parse_mode: "Markdown"
        });
    }
};