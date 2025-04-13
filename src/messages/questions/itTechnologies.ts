import { profileKeyboard, textKeyboard, itTechnologiesKeyboard, ageKeyboard, itGithubKeyboard } from "../../constants/keyboards";
import { saveUser } from "../../functions/db/saveUser"; 
import { hasLinks } from "../../functions/hasLinks";
import { sendForm } from "../../functions/sendForm";
import { MyContext } from "../../typescript/context";
import { IItProfile, ISportProfile } from "../../typescript/interfaces/IProfile";

export const itTechnologiesQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'it_technologies',
        input: message,
        profileType: ctx.session.activeProfile?.profileType,
        editingMode: !!ctx.session.additionalFormInfo.canGoBack
    }, 'User answering IT technologies question');

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User returning to profile from IT technologies edit');
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (!message || message === ctx.t('skip')) {
        ctx.logger.info({ userId }, 'User skipped IT technologies');
        (ctx.session.activeProfile as IItProfile).technologies = "";
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after skipping technologies in edit mode');
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId }, 'Proceeding to GitHub question after skipping technologies');
            ctx.session.question = "it_github";

            await ctx.reply(ctx.t('it_github_question'), {
                reply_markup: itGithubKeyboard(ctx.t, ctx.session),
                parse_mode: "Markdown",
                link_preview_options: {
                    is_disabled: true
                }
            });
        }
    } else if (hasLinks(message)) {
        ctx.logger.warn({ userId }, 'User IT technologies contains links');
        await ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
        });
    } else {
        const technologies = message.split(" ").filter(tech => tech.length > 0);
        
        // Проверяем количество технологий
        if (technologies.length > 20) {
            ctx.logger.warn({ userId, technologiesCount: technologies.length }, 'Too many technologies');
            await ctx.reply(ctx.t('it_technologies_long_all'), {
                reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
            });
            return;
        }

        // Проверяем длину каждой технологии
        const longTechs = technologies.filter(tech => tech.length > 20);
        if (longTechs.length > 0) {
            ctx.logger.warn({ 
                userId, 
                longTechnologies: longTechs 
            }, 'Some technologies are too long');
            
            await ctx.reply(ctx.t('it_technologies_long_one'), {
                reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
            });
            return;
        }

        // Проверяем на дубликаты
        if (new Set(technologies).size !== technologies.length) {
            ctx.logger.warn({ userId, technologies }, 'Technologies contain duplicates');
            await ctx.reply(ctx.t('it_technologies_duplicates'), {
                reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
            });
            return;
        }

        ctx.logger.info({ 
            userId, 
            technologiesCount: technologies.length,
            technologies: technologies.join(" ")
        }, 'User IT technologies validated and saved');
        
        (ctx.session.activeProfile as IItProfile).technologies = technologies.join(" ");
        
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after saving technologies in edit mode');
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId }, 'Proceeding to GitHub question after saving technologies');
            ctx.session.question = "it_github";

            await ctx.reply(ctx.t('it_github_question'), {
                reply_markup: itGithubKeyboard(ctx.t, ctx.session),
                parse_mode: "Markdown",
                link_preview_options: {
                    is_disabled: true
                }
            });
        }
    }
}
