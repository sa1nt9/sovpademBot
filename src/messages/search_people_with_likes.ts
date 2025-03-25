import { answerLikesFormKeyboard, complainKeyboard, complainToUserKeyboard, continueSeeFormsKeyboard, optionsToUserKeyboard, profileKeyboard } from '../constants/keyboards';
import { getOneLike } from '../functions/db/getOneLike';
import { saveLike } from '../functions/db/saveLike';
import { setMutualLike } from '../functions/db/setMutualLike';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { bot } from '../main';
import { MyContext } from '../typescript/context';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';

export async function searchPeopleWithLikesStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === '❤️') {
        if (ctx.session.currentCandidate) {
            ctx.logger.info(ctx.session.currentCandidate, 'Candidate to set mutual like')

            await setMutualLike(ctx.session.currentCandidate.id, String(ctx.from!.id));
            await saveLike(ctx, ctx.session.currentCandidate.id, true, { isMutual: true });

            const userInfo = await ctx.api.getChat(ctx.session.currentCandidate.id);

            await sendLikesNotification(ctx, ctx.session.currentCandidate.id, true)

            ctx.session.step = 'continue_see_likes_forms'

            await ctx.reply(`${ctx.t('good_mutual_sympathy')} [${ctx.session.currentCandidate.name}](https://t.me/${userInfo.username})`, {
                reply_markup: complainToUserKeyboard(ctx.t, String(ctx.session.currentCandidate.id)),
                parse_mode: 'Markdown',
            });
        }

    } else if (message === '👎') {
        if (ctx.session.currentCandidate) {
            await saveLike(ctx, ctx.session.currentCandidate.id, false);

            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }

            const oneLike = await getOneLike(String(ctx.from!.id));

            if (oneLike?.user) {
                ctx.session.currentCandidate = oneLike.user
                await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
            } else {
                ctx.session.step = 'continue_see_forms'
                ctx.session.additionalFormInfo.searchingLikes = false

                await ctx.reply(ctx.t('its_all_go_next_question'), {
                    reply_markup: continueSeeFormsKeyboard(ctx.t)
                });
            }
        }


    } else if (message === '⚠️') {
        ctx.session.step = "complain";

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        })
    } else if (message === '📋') {
        ctx.session.step = 'options_to_user'

        await ctx.reply(ctx.t('more_options_message'), {
            reply_markup: optionsToUserKeyboard(ctx.t)
        })
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: answerLikesFormKeyboard()
        });
    }
} 