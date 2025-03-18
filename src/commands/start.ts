import { languageKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { decodeId } from "../functions/encodeId";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const startCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);
    const startParam = ctx.message?.text?.split(' ')[1];

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    ctx.logger.info({
        msg: 'start',
        existingUser: existingUser
    })

    if (startParam?.startsWith('i_')) {
        const encodedReferrerId = startParam.substring(2);
        if (encodedReferrerId) {
            try {
                const referrerId = decodeId(encodedReferrerId);
                if (referrerId && referrerId !== userId) {
                    if (!existingUser) {
                        ctx.session.referrerId = referrerId
                    }
                }
            } catch (error) {
                ctx.logger.error({
                    msg: 'Error decoding referrer ID',
                    error: error
                });
            }
        }
    }

    if (existingUser) {
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        ctx.session.step = "choose_language_start";

        await ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    }
}