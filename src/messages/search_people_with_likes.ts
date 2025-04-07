import { answerLikesFormKeyboard, complainKeyboard, complainToUserKeyboard, continueSeeFormsKeyboard, optionsToUserKeyboard, profileKeyboard } from '../constants/keyboards';
import { getOneLike } from '../functions/db/getOneLike';
import { saveLike } from '../functions/db/saveLike';
import { setMutualLike } from '../functions/db/setMutualLike';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { MyContext } from '../typescript/context';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';

export async function searchPeopleWithLikesStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === '❤️') {
        if (ctx.session.currentCandidateProfile) {
            ctx.logger.info(ctx.session.currentCandidateProfile, 'Candidate to set mutual like')

            await setMutualLike(ctx.session.currentCandidateProfile.id, ctx.session.activeProfile.id);
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, true, { isMutual: true });

            const userInfo = await ctx.api.getChat(ctx.session.currentCandidateProfile.userId);

            await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId, true)

            ctx.session.step = 'continue_see_likes_forms'

            await ctx.reply(`${ctx.t('good_mutual_sympathy')} [${ctx.session.currentCandidateProfile.user?.name}](https://t.me/${userInfo.username})`, {
                reply_markup: complainToUserKeyboard(ctx.t, String(ctx.session.currentCandidateProfile.userId)),
                link_preview_options: {
                    is_disabled: true
                },
                parse_mode: 'Markdown',
            });
        }

    } else if (message === '👎') {
        if (ctx.session.currentCandidateProfile) {
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, false);

            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }

            const oneLike = await getOneLike(String(ctx.from!.id), 'user');

            if (oneLike?.fromProfile) {
                ctx.session.currentCandidateProfile = oneLike.fromProfile
                await sendForm(ctx, oneLike.fromProfile, { myForm: false, like: oneLike });
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