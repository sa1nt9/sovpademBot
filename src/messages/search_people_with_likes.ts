import { answerLikesFormKeyboard, complainKeyboard, complainToUserKeyboard, continueKeyboard, continueSeeFormsKeyboard, optionsToUserKeyboard, profileKeyboard } from '../constants/keyboards';
import { getOneLike } from '../functions/db/getOneLike';
import { saveLike } from '../functions/db/saveLike';
import { setMutualLike } from '../functions/db/setMutualLike';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { MyContext } from '../typescript/context';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { prisma } from '../db/postgres';

export async function searchPeopleWithLikesStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, action: message }, 'User in likes search');

    if (message === '❤️') {
        if (ctx.session.currentCandidateProfile) {
            const candidateId = ctx.session.currentCandidateProfile.id;
            const candidateUserId = ctx.session.currentCandidateProfile.userId;
            
            ctx.logger.info({ userId, candidateId, candidateUserId }, 'Creating mutual like');

            const targetProfile = await (prisma as any)[`${ctx.session.currentCandidateProfile.profileType?.toLowerCase()}Profile`].findUnique({
                where: {
                    id: candidateId
                }
            });

            const fromProfile = await (prisma as any)[`${targetProfile.profileType?.toLowerCase()}Profile`].findFirst({
                where: targetProfile?.profileType === "RELATIONSHIP" ? {
                    profileType: targetProfile?.profileType,
                    userId: userId
                } : {
                    profileType: targetProfile?.profileType,
                    subType: targetProfile?.subType,
                    userId: userId
                }
            });

            await setMutualLike(candidateId, ctx.session.activeProfile.id);
            await saveLike(ctx, candidateId, true, { isMutual: true, fromProfileId: fromProfile?.id });

            const userInfo = await ctx.api.getChat(candidateUserId);

            await sendLikesNotification(ctx, candidateUserId, candidateId, fromProfile?.id, fromProfile?.profileType, fromProfile.subType || "", true)

            ctx.session.step = 'continue_see_likes_forms'

            await ctx.reply(`${ctx.t('good_mutual_sympathy')} [${ctx.session.currentCandidateProfile.user?.name}](https://t.me/${userInfo.username})`, {
                reply_markup: complainToUserKeyboard(ctx.t, String(candidateUserId)),
                link_preview_options: {
                    is_disabled: true
                },
                parse_mode: 'Markdown',
            });

            const oneLike = await getOneLike(userId, 'user');
            ctx.logger.debug({ userId, hasMoreLikes: !!oneLike }, 'Checking for more likes');

            if (oneLike?.fromProfile) {
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    await sendMutualSympathyAfterAnswer(ctx, { withoutSleepMenu: true })
                }

                ctx.session.step = 'continue_see_likes_forms'
                ctx.session.additionalFormInfo.searchingLikes = true

                await ctx.reply(ctx.t('continue_searching_likes'), {
                    reply_markup: continueKeyboard(ctx.t)
                });
            } else {
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    await sendMutualSympathyAfterAnswer(ctx, { withoutSleepMenu: true })
                }

                ctx.session.step = 'continue_see_forms'
                ctx.session.additionalFormInfo.searchingLikes = false

                await ctx.reply(ctx.t('its_all_go_next_question'), {
                    reply_markup: continueKeyboard(ctx.t)
                });
            }
        }

    } else if (message === '👎') {
        if (ctx.session.currentCandidateProfile) {
            const candidateId = ctx.session.currentCandidateProfile.id;
            ctx.logger.info({ userId, candidateId }, 'User disliked profile in likes search');
            
            await saveLike(ctx, candidateId, false);

            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }

            const oneLike = await getOneLike(userId, 'user');

            if (oneLike?.fromProfile) {
                ctx.logger.info({ userId }, 'Showing next like');
                ctx.session.currentCandidateProfile = oneLike.fromProfile
                await sendForm(ctx, oneLike.fromProfile, { myForm: false, like: oneLike });
            } else {
                ctx.logger.info({ userId }, 'No more likes to show');
                ctx.session.step = 'continue_see_forms'
                ctx.session.additionalFormInfo.searchingLikes = false

                await ctx.reply(ctx.t('its_all_go_next_question'), {
                    reply_markup: continueSeeFormsKeyboard(ctx.t)
                });
            }
        }

    } else if (message === '⚠️') {
        ctx.logger.info({ 
            userId, 
            reportedUserId: ctx.session.currentCandidateProfile?.userId 
        }, 'User reporting profile from likes search');
        
        ctx.session.step = "complain";

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        })
    } else if (message === '📋') {
        ctx.logger.info({ userId }, 'User selected more options in likes search');
        ctx.session.step = 'options_to_user'

        await ctx.reply(ctx.t('more_options_message'), {
            reply_markup: optionsToUserKeyboard(ctx.t)
        })
    } else {
        ctx.logger.warn({ userId, message }, 'Unknown action in likes search');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: answerLikesFormKeyboard()
        });
    }
} 