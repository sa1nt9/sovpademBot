import { profileKeyboard, textKeyboard, itTechnologiesKeyboard, ageKeyboard, itGithubKeyboard } from "../../constants/keyboards";
import { saveUser } from "../../functions/db/saveUser";
import { hasLinks } from "../../functions/hasLinks";
import { sendForm } from "../../functions/sendForm";
import { MyContext } from "../../typescript/context";
import { IItProfile, ISportProfile } from "../../typescript/interfaces/IProfile";
import { githubLinkRegex } from "../../constants/regex/githubLinkRegex";
import { checkGithubUserExists, getGithubUsername } from "../../functions/githubLink";

export const itGithubQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && !githubLinkRegex.test(message) && message !== ctx.t('skip') && message !== ctx.t('leave_current')) { 
        await ctx.reply(ctx.t('it_github_question_validate'), {
            reply_markup: itGithubKeyboard(ctx.t, ctx.session),
            parse_mode: "Markdown",
            link_preview_options: {
                is_disabled: true
            }
        });
    } else {
        if (message !== ctx.t('leave_current')) {
            if (message && message !== ctx.t('skip')) {
                const isExists = await checkGithubUserExists(message || "")
                if (!isExists) {
                    await ctx.reply(ctx.t('it_github_question_not_exists'), {
                        reply_markup: itGithubKeyboard(ctx.t, ctx.session),
                        parse_mode: "Markdown",
                        link_preview_options: {
                            is_disabled: true
                        }
                    });
                    return;
                }
            }
            (ctx.session.activeProfile as IItProfile).github = (!message || message === ctx.t('skip')) ? "" : (getGithubUsername(message) || "")    
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
