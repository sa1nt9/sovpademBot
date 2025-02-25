import { MyContext } from "../main";

export async function checkSubscription(ctx: MyContext, channelId: string) {
    try {
        const member = await ctx.api.getChatMember(`@${channelId}`, ctx.from?.id!);
        if (["member", "administrator", "creator"].includes(member.status)) {
            return true; // Подписан
        } else {
            return false; // Не подписан
        }
    } catch (error) {
        console.error("Ошибка проверки подписки:", error);
        return false; // Ошибка — считаем, что не подписан
    }
}
