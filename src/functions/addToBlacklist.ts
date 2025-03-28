import { answerFormKeyboard } from "../constants/keyboards";
import { getCandidate } from "./db/getCandidate";
import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { sendMutualSympathyAfterAnswer } from "./sendMutualSympathyAfterAnswer";
import { sendForm } from "./sendForm";
import { candidatesEnded } from "./candidatesEnded";


export const addToBlacklist = async (ctx: MyContext) => {
    if (ctx.session.currentCandidate) {
        // Проверяем, не добавлен ли уже пользователь в черный список
        const existingBlacklist = await prisma.blacklist.findFirst({
            where: {
                userId: String(ctx.from?.id),
                targetId: ctx.session.currentCandidate.id
            }
        });

        if (existingBlacklist) {
            await ctx.reply(ctx.t('more_options_blacklist_already'));
            return;
        }

        // Добавляем пользователя в черный список
        await prisma.blacklist.create({
            data: {
                userId: String(ctx.from?.id),
                targetId: ctx.session.currentCandidate.id
            }
        });

        await ctx.reply(ctx.t('more_options_blacklist_success'));


        ctx.session.step = 'search_people';

        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
            await sendMutualSympathyAfterAnswer(ctx)
            return
        }

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx);
        ctx.logger.info(candidate, 'This is new candidate');
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false });
        } else {
            await candidatesEnded(ctx);
        }
    }
    
}
