import { fileKeyboard, profileKeyboard, textKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { hasLinks } from "../../functions/hasLinks";
import { saveUser } from "../../functions/db/saveUser";
import { sendForm } from "../../functions/sendForm";
import { getUserProfile } from "../../functions/db/profilesService";

export const textQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'text', 
        input: message,
        profileType: ctx.session.activeProfile?.profileType,
        editingMode: !!ctx.session.additionalFormInfo.canGoBack
    }, 'User answering profile description question');

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User returning to profile from text edit');
        ctx.session.question = "years";
        ctx.session.step = 'profile'
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && message.length > 1000) {
        ctx.logger.warn({ userId, textLength: message.length }, 'User description too long');
        await ctx.reply(ctx.t('long_text'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else if (hasLinks(message || "")) {
        ctx.logger.warn({ userId }, 'User description contains links');
        await ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else {
        if (message !== ctx.t('leave_current')) {
            const isSkipped = !message || message === ctx.t('skip');
            ctx.logger.info({ 
                userId, 
                textLength: message?.length || 0,
                skipped: isSkipped 
            }, 'User description validated and saved');
            
            ctx.session.activeProfile.description = isSkipped ? "" : message;
        } else {
            ctx.logger.info({ userId }, 'User keeping current description');
        }
        
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Saving profile after text edit and returning to main menu');
            ctx.session.question = "years";
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx, { onlyProfile: true })

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId }, 'Proceeding to file upload stage');
            ctx.session.question = "file";

            const profile = await getUserProfile(String(ctx.message!.from.id), ctx.session.activeProfile.profileType, (ctx.session.activeProfile as any).subType)
            const files = profile?.files || []

            await ctx.reply(ctx.t('file_question'), {
                reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
            });
        }
    }
} 