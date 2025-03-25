import { answerFormKeyboard, disableFormKeyboard, goBackKeyboard, inviteFriendsKeyboard, profileKeyboard, rouletteStartKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { getCandidate } from '../functions/db/getCandidate';
import { encodeId } from '../functions/encodeId';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';
import { showRouletteStart } from './roulette_start';
import { candidatesEnded } from '../functions/candidatesEnded';
export async function sleepMenuStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === '1 🚀') {
        ctx.session.step = 'search_people'
        ctx.session.question = 'years'

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            await candidatesEnded(ctx)
        }

    } else if (message === '2') {
        ctx.session.step = 'profile';

        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });

    } else if (message === '3') {
        ctx.session.step = 'disable_form'

        await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
            reply_markup: disableFormKeyboard()
        })

    } else if (message === '4') {
        ctx.session.step = 'friends'

        const encodedId = encodeId(String(ctx.message!.from.id));
        const url = `https://t.me/${process.env.BOT_USERNAME}?start=i_${encodedId}`;
        const text = `${ctx.t('invite_link_message', { botname: process.env.CHANNEL_NAME || "" })}`

        const now = new Date();
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const comeIn14Days = await prisma.user.count({
            where: {
                referrerId: String(ctx.message!.from.id),
                createdAt: {
                    gte: fourteenDaysAgo
                }
            }
        })
        const comeInAll = await prisma.user.count({
            where: {
                referrerId: String(ctx.message!.from.id)
            }
        })
        const bonus = Math.min(comeIn14Days * 10 + (comeInAll - comeIn14Days) * 5, 100)

        await ctx.reply(ctx.t('invite_friends_message', { bonus, comeIn14Days, comeInAll }), {
            reply_markup: goBackKeyboard(ctx.t),
        });

        const inviteLinkText =
            `${ctx.t('invite_link_message', { botname: process.env.CHANNEL_NAME || "" })}
👉 ${url}`
        await ctx.reply(inviteLinkText, {
            reply_markup: inviteFriendsKeyboard(ctx.t, url, text),
        });
    } else if (message === '5 🎲') {
        ctx.session.step = 'roulette_start';
        
        await showRouletteStart(ctx);
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: profileKeyboard()
        });
    }
} 