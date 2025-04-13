import { profileKeyboard, textKeyboard, itTechnologiesKeyboard, ageKeyboard, itGithubKeyboard, gameAccountKeyboard } from "../../constants/keyboards";
import { saveUser } from "../../functions/db/saveUser";
import { getGameUsername } from "../../functions/gameLink";
import { sendForm } from "../../functions/sendForm";
import { MyContext } from "../../typescript/context";
import { IGameProfile } from "../../typescript/interfaces/IProfile";

export const gameAccountQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'game_account',
        input: message,
        gameType: ctx.session.additionalFormInfo.selectedSubType,
        profileType: ctx.session.activeProfile?.profileType,
        editingMode: !!ctx.session.additionalFormInfo.canGoBack
    }, 'User answering game account question');

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User returning to profile from game account edit');
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && !getGameUsername((ctx.session.additionalFormInfo.selectedSubType as any), message) && message !== ctx.t('skip') && message !== ctx.t('leave_current')) {
        ctx.logger.warn({ 
            userId, 
            gameType: ctx.session.additionalFormInfo.selectedSubType,
            accountLink: message 
        }, 'Invalid game account format');
        
        await ctx.reply(ctx.t('game_account_question_validate'), {
            reply_markup: gameAccountKeyboard(ctx.t, ctx.session)
        });
    } else {
        if (message !== ctx.t('leave_current')) {
            if (message && message !== ctx.t('skip')) {
                const username = getGameUsername((ctx.session.additionalFormInfo.selectedSubType as any), message) || "";
                ctx.logger.info({ 
                    userId, 
                    gameType: ctx.session.additionalFormInfo.selectedSubType,
                    gameUsername: username 
                }, 'Game account validated and saved');
                
                (ctx.session.activeProfile as IGameProfile).accountLink = username;
            } else {
                ctx.logger.info({ userId }, 'User skipped game account');
                (ctx.session.activeProfile as IGameProfile).accountLink = "";
            }
        } else {
            ctx.logger.info({ userId }, 'User keeping current game account');
        }
        
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after game account in edit mode');
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId }, 'Proceeding to age question after game account');
            ctx.session.question = 'years';

            await ctx.reply(ctx.t('years_question'), {
                reply_markup: ageKeyboard(ctx.session)
            });
        }
    }
}
