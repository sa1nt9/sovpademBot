import { profileKeyboard, textKeyboard, itTechnologiesKeyboard, ageKeyboard, itGithubKeyboard } from "../../constants/keyboards";
import { saveUser } from "../../functions/db/saveUser"; 
import { hasLinks } from "../../functions/hasLinks";
import { sendForm } from "../../functions/sendForm";
import { MyContext } from "../../typescript/context";
import { IItProfile, ISportProfile } from "../../typescript/interfaces/IProfile";

export const itTechnologiesQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (!message || message === ctx.t('skip')) {
        (ctx.session.activeProfile as IItProfile).technologies = "";
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
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
        await ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
        });
    } else {
        const technologies = message.split(" ").filter(tech => tech.length > 0);
        
        // Проверяем количество технологий
        if (technologies.length > 20) {
            await ctx.reply(ctx.t('it_technologies_long_all'), {
                reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
            });
            return;
        }

        // Проверяем длину каждой технологии
        if (technologies.some(tech => tech.length > 20)) {
            await ctx.reply(ctx.t('it_technologies_long_one'), {
                reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
            });
            return;
        }

        // Проверяем на дубликаты
        if (new Set(technologies).size !== technologies.length) {
            await ctx.reply(ctx.t('it_technologies_duplicates'), {
                reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
            });
            return;
        }

        (ctx.session.activeProfile as IItProfile).technologies = technologies.join(" ");
        
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
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
