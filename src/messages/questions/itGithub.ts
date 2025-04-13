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
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'it_github',
        input: message,
        profileType: ctx.session.activeProfile?.profileType,
        editingMode: !!ctx.session.additionalFormInfo.canGoBack
    }, 'User answering GitHub account question');

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User returning to profile from GitHub edit');
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && !githubLinkRegex.test(message) && message !== ctx.t('skip') && message !== ctx.t('leave_current')) { 
        ctx.logger.warn({ userId, githubLink: message }, 'Invalid GitHub link format');
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
                ctx.logger.info({ userId, githubLink: message }, 'Validating GitHub account existence');
                const isExists = await checkGithubUserExists(message || "")
                if (!isExists) {
                    ctx.logger.warn({ userId, githubLink: message }, 'GitHub account does not exist');
                    await ctx.reply(ctx.t('it_github_question_not_exists'), {
                        reply_markup: itGithubKeyboard(ctx.t, ctx.session),
                        parse_mode: "Markdown",
                        link_preview_options: {
                            is_disabled: true
                        }
                    });
                    return;
                }
                
                const username = getGithubUsername(message) || "";
                ctx.logger.info({ userId, githubUsername: username }, 'GitHub account validated and saved');
                (ctx.session.activeProfile as IItProfile).github = username;
            } else {
                ctx.logger.info({ userId }, 'User skipped GitHub account');
                (ctx.session.activeProfile as IItProfile).github = "";
            }
        } else {
            ctx.logger.info({ userId }, 'User keeping current GitHub account');
        }
        
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after GitHub account in edit mode');
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId }, 'Proceeding to age question after GitHub account');
            ctx.session.question = 'years';

            await ctx.reply(ctx.t('years_question'), {
                reply_markup: ageKeyboard(ctx.session)
            });
        }
    }
}
