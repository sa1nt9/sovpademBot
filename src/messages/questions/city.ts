import { cityKeyboard, nameKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import fs from 'fs';
import { haversine } from "../../functions/haversine";

export const cityQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    
    if (message === `${ctx.session.activeProfile.ownCoordinates ? "📍 " : ""}${ctx.session.activeProfile.city}`) {
        ctx.session.question = "name";

        await ctx.reply(ctx.t('name_question'), {
            reply_markup: nameKeyboard(ctx.session)
        });
    } else if (ctx.message!.location) {
        const { latitude, longitude } = ctx.message!.location;

        try {
            const cities: any[] = JSON.parse(fs.readFileSync("./data/cities.json", "utf-8"));

            let nearestCity = null;
            let minDistance = Infinity;

            for (const city of cities) {
                const distance = haversine(latitude, longitude, city.latitude, city.longitude);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCity = city;
                }
            }

            if (nearestCity) {
                ctx.logger.info({
                    nearestCity: nearestCity.name,
                    distance: `${minDistance.toFixed(2)} км`,
                    msg: "Ближайший город"
                })
                ctx.session.activeProfile.city = nearestCity.name
                ctx.session.activeProfile.ownCoordinates = true
                ctx.session.activeProfile.location = { longitude: nearestCity.longitude, latitude: nearestCity.latitude }
            }

            ctx.session.question = "name";

            await ctx.reply(ctx.t("name_question"), {
                reply_markup: nameKeyboard(ctx.session),
            });
        } catch (error) {
            console.error("Ошибка чтения файла cities.json:", error);
            await ctx.reply("Ошибка обработки данных.");
        }
    } else {
        try {
            const cities: any[] = JSON.parse(fs.readFileSync("./data/cities.json", "utf-8"));
            const normalizedMessage = message?.trim().toLowerCase();

            const foundCity = cities.find(city => {
                const cityNames = [city.name, ...(city.alternateNames || [])];
                return cityNames.some(cityName => cityName.toLowerCase() === normalizedMessage);
            });

            if (foundCity) {
                ctx.session.activeProfile.city = message || ""
                ctx.session.activeProfile.ownCoordinates = false
                ctx.session.activeProfile.location = { longitude: foundCity.longitude, latitude: foundCity.latitude }
                ctx.session.question = "name";
                await ctx.reply(ctx.t('name_question'), {
                    reply_markup: nameKeyboard(ctx.session)
                });
            } else {
                await ctx.reply(ctx.t('no_such_city'), {
                    reply_markup: cityKeyboard(ctx.t, ctx.session)
                });
            }
        } catch (error) {
            console.error('Ошибка чтения файла cities.json:', error);
            await ctx.reply("error");
        }
    }
} 