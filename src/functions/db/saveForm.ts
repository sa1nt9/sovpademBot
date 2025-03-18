import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";


export async function saveForm(ctx: MyContext) {
    try {
        const userData = ctx.session.form;
        const userId = String(ctx.message?.from.id);

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (existingUser) {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name: userData.name || "",
                    city: userData.city || "",
                    gender: userData.gender || "",
                    age: userData.age || 0,
                    interestedIn: userData.interestedIn || "",
                    longitude: userData.location.longitude,
                    latitude: userData.location.latitude,
                    text: userData.text || "",
                    files: JSON.stringify(userData.files || []),
                    ownCoordinates: userData.ownCoordinates
                },
            });
            ctx.logger.info({
                msg: 'Пользователь обновлен',
                updatedUser: updatedUser
            })
            return updatedUser;
        } else {
            const newUser = await prisma.user.create({
                data: {
                    id: userId,
                    name: userData.name || "",
                    city: userData.city || "",
                    gender: userData.gender || "",
                    age: userData.age || 0,
                    interestedIn: userData.interestedIn || "",
                    longitude: userData.location.longitude,
                    referrerId: ctx.session.referrerId || "",
                    latitude: userData.location.latitude,
                    text: userData.text || "",
                    files: JSON.stringify(userData.files || []),
                    ownCoordinates: userData.ownCoordinates
                },
            });

            ctx.logger.info({
                msg: 'Новый пользователь сохранен',
                newUser: newUser
            })
            return newUser;
        }
    } catch (error) {
        ctx.logger.error({
            msg: 'Ошибка при сохранении пользователя',
            error: error
        })
    }
}