import { answerFormKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { toggleProfileActive } from "./db/profilesService";

interface StartSearchingPeopleOptions {
    setActive?: boolean;
}

export async function startSearchingPeople(ctx: MyContext, options: StartSearchingPeopleOptions = {}) {
    const userId = String(ctx.from?.id);
    ctx.logger.info({ userId, setActive: options.setActive }, 'Starting people search');
    
    ctx.session.step = 'search_people';

    await ctx.reply("✨🔍", {
        reply_markup: answerFormKeyboard()
    });

    if (options.setActive) {
        await toggleProfileActive(userId, ctx.session.activeProfile.profileType, true, ctx.session.activeProfile.profileType !== "RELATIONSHIP" ? ctx.session.activeProfile.subType : undefined);
        ctx.logger.info({ userId }, 'Profile activated for search');
    }
}
