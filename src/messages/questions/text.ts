import { fileKeyboard, profileKeyboard, textKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { hasLinks } from "../../functions/hasLinks";
import { saveUser } from "../../functions/db/saveUser";
import { sendForm } from "../../functions/sendForm";
import { getUserProfile } from "../../functions/db/profilesService";

export const textQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.question = "years";
        ctx.session.step = 'profile'
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && message.length > 1000) {
        await ctx.reply(ctx.t('long_text'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else if (hasLinks(message || "")) {
        await ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else {
        if (message !== ctx.t('leave_current')) {
            ctx.session.activeProfile.description = (!message || message === ctx.t('skip')) ? "" : message;
        }
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.question = "years";
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx, { onlyProfile: true })

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.session.question = "file";

            const profile = await getUserProfile(String(ctx.message!.from.id), ctx.session.activeProfile.profileType, (ctx.session.activeProfile as any).subType)
            const files = profile?.files || []

            await ctx.reply(ctx.t('file_question'), {
                reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
            });
        }
    }
} 