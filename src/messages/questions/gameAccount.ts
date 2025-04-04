import { profileKeyboard, textKeyboard, itTechnologiesKeyboard, ageKeyboard, itGithubKeyboard, gameAccountKeyboard } from "../../constants/keyboards";
import { saveUser } from "../../functions/db/saveUser";
import { getGameUsername } from "../../functions/gameLink";
import { sendForm } from "../../functions/sendForm";
import { MyContext } from "../../typescript/context";
import { IGameProfile } from "../../typescript/interfaces/IProfile";

export const gameAccountQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && !getGameUsername((ctx.session.activeProfile as IGameProfile)?.subType, message) && message !== ctx.t('skip') && message !== ctx.t('leave_current')) {
        await ctx.reply(ctx.t('game_account_question_validate'), {
            reply_markup: gameAccountKeyboard(ctx.t, ctx.session)
        });
    } else {
        if (message !== ctx.t('leave_current')) {
            (ctx.session.activeProfile as IGameProfile).accountLink = (!message || message === ctx.t('skip')) ? "" : (getGameUsername((ctx.session.activeProfile as IGameProfile)?.subType, message) || "")    
        }
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.session.question = 'years';

            await ctx.reply(ctx.t('years_question'), {
                reply_markup: ageKeyboard(ctx.session)
            });
        }
    }
}
