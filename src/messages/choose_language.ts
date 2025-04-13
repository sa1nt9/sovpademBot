import { MyContext } from '../typescript/context';
import { languages } from "../constants/languages";
import { prepareMessageKeyboard, languageKeyboard, profileKeyboard, ageKeyboard, acceptPrivacyKeyboard, createProfileTypeKeyboard } from "../constants/keyboards";
import { sendForm } from '../functions/sendForm';
import { prisma } from '../db/postgres';


export async function chooseLanguageStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const language = languages.find(i => i.name === message);
    const userId = String(ctx.message?.from.id);
    
    ctx.logger.info({ userId, step: 'choose_language', selectedLanguage: message }, 'User selecting language');

    if (language) {
        ctx.logger.info({ userId, languageCode: language.mark }, 'Language selected successfully');
        await ctx.i18n.setLocale(language.mark || "ru");

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (existingUser) {
            ctx.logger.info({ userId, existingUser: true }, 'Existing user found, navigating to profile');
            ctx.session.step = "profile";

            await sendForm(ctx)

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId, newUser: true }, 'New user detected');
            
            if (ctx.session.privacyAccepted) {
                ctx.logger.info({ userId }, 'Privacy accepted, proceeding to profile creation');
                ctx.session.step = "create_profile_type"
                ctx.session.isCreatingProfile = true;

                await ctx.reply(ctx.t('profile_type_title'), {
                    reply_markup: createProfileTypeKeyboard(ctx.t)
                });
            } else {
                ctx.logger.info({ userId }, 'Redirecting to privacy acceptance');
                ctx.session.step = "accept_privacy";

                await ctx.reply(ctx.t('privacy_message'), {
                    reply_markup: acceptPrivacyKeyboard(ctx.t),
                });
            }
        }
    } else {
        ctx.logger.warn({ userId, invalidLanguage: message }, 'User selected invalid language option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: languageKeyboard
        });
    }
} 