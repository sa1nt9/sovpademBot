import { MyContext } from '../typescript/context';
import { languages } from "../constants/languages";
import { prepareMessageKeyboard, languageKeyboard, profileKeyboard, ageKeyboard, acceptPrivacyKeyboard } from "../constants/keyboards";
import { sendForm } from '../functions/sendForm';
import { prisma } from '../db/postgres';


export async function chooseLanguageStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const language = languages.find(i => i.name === message);

    if (language) {
        await ctx.i18n.setLocale(language.mark || "ru");
        const userId = String(ctx.message?.from.id);

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (existingUser) {
            ctx.session.step = "profile";


            await sendForm(ctx)

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            if (ctx.session.privacyAccepted) {
                ctx.session.step = "questions";
                ctx.session.question = 'years'

                await ctx.reply(ctx.t('years_question'), {
                    reply_markup: ageKeyboard(ctx.session)
                });
            } else {
                ctx.session.step = "accept_privacy";

                await ctx.reply(ctx.t('privacy_message'), {
                    reply_markup: acceptPrivacyKeyboard(ctx.t),
                });
            }
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: languageKeyboard
        });
    }
} 