import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { ProfileType, SportType, GameType, HobbyType, ITType } from "@prisma/client";
import { restoreProfileValues } from "../functions/restoreProfileValues";

export const changeSessionFieldsMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    if (ctx.inlineQuery) {
        await next();
        return;
    }

    if (ctx.session.step !== 'questions' && ctx.session.step !== 'create_profile_type' && ctx.session.step !== 'create_profile_subtype') {
        if (ctx.session.isEditingProfile) {
            ctx.session.isEditingProfile = false;

            await restoreProfileValues(ctx);
        }
        if (ctx.session.isCreatingProfile) {
            ctx.session.isCreatingProfile = false;

            await restoreProfileValues(ctx);
        }
        
    }

    if (ctx.session.step !== 'questions' && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.additionalFormInfo.canGoBack = false;
    }

    if (ctx.session.step !== 'questions' && ctx.session.additionalFormInfo.keepUserInfo) {
        ctx.session.additionalFormInfo.keepUserInfo = false;
    }

    if (ctx.session.step !== "search_people_with_likes" && ctx.session.step !== "somebodys_liked_you" && ctx.session.step !== "complain" && ctx.session.step !== "continue_see_likes_forms" && ctx.session.step !== "complain_text" && ctx.session.additionalFormInfo.searchingLikes) {
        ctx.session.additionalFormInfo.searchingLikes = false;
    }


    await next();
};

