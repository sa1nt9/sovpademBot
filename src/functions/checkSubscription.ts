import { MyContext } from "../typescript/context";

export async function checkSubscription(ctx: MyContext, channelId: string) {
    const userId = Number(ctx.from?.id);
    try {
        const member = await ctx.api.getChatMember(`@${channelId}`, userId);
        if (["member", "administrator", "creator"].includes(member.status)) {
            return true; // Подписан
        } else {
            return false; // Не подписан
        }
    } catch (error) {
        ctx.logger.error({
            msg: 'Ошибка проверки подписки',
            error: error
        })
        return false; // Ошибка — считаем, что не подписан
    }
}
