import { ProfileType } from "@prisma/client";
import { cityKeyboard, interestedInKeyboard, nameKeyboard, textKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const interestedInQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);

    ctx.logger.info({
        userId,
        question: 'interested_in',
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering interested in question');

    if (interestedInKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
        const interestedIn = message === ctx.t('men') ? 'male' : message === ctx.t('women') ? 'female' : "all";
        ctx.logger.info({ userId, interestedIn }, 'User preference validated and saved');

        ctx.session.activeProfile.interestedIn = interestedIn;
        if (ctx.session.additionalFormInfo.keepUserInfo) {
            ctx.session.question = "text";

            await ctx.reply(ctx.t('text_question', {
                profileType: ctx.session.additionalFormInfo.selectedProfileType
            }), {
                reply_markup: textKeyboard(ctx.t, ctx.session)
            });
        } else {
            ctx.session.question = "city";

            await ctx.reply(ctx.t('city_question'), {
                reply_markup: cityKeyboard(ctx.t, ctx.session)
            });
        }

    } else {
        ctx.logger.warn({ userId, invalidInput: message }, 'User provided invalid preference option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: interestedInKeyboard(ctx.t)
        });
    }
} 