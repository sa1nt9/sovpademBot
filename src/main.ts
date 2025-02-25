import { Bot, Context, session, SessionFlavor } from "grammy";
import * as dotenv from 'dotenv';
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { languages } from "./constants/languages";
import { acceptPrivacyKeyboard, ageKeyboard, cityKeyboard, genderKeyboard, interestedInKeyboard, languageKeyboard, nameKeyboard, prepareMessageKeyboard, subscribeChannelKeyboard, textKeyboard } from "./constants/keyboards";
import fs from 'fs';
import { PsqlAdapter } from '@grammyjs/storage-psql';
import { Client } from "pg";
import { ISessionData } from "./typescript/interfaces/ISessionData";
import { haversine } from "./functions/haversine";
import { checkSubscription } from "./functions/checkSubscription";
import { sessionInitial } from "./functions/sessionInitial";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


dotenv.config();
console.log(process.env.BOT_TOKEN)


export type MyContext =
    Context
    & SessionFlavor<ISessionData>
    & I18nFlavor;


const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));


const i18n = new I18n<MyContext>({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});


async function startBot() {
    const client = new Client({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: process.env.POSTGRES_USERNAME || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'root',
        database: process.env.POSTGRES_NAME || 'postgres',
    });

    const s3 = new S3Client({
        region: process.env.S3_REGION || "us-east-1",
        endpoint: process.env.S3_ENDPOINT || undefined,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || "",
            secretAccessKey: process.env.S3_SECRET_KEY || "",
        },
    });

    await client.connect();

    bot.use(
        session({
            initial: sessionInitial,
            storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
        })
    );

    bot.use(i18n);

    const checkSubscriptionMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
        if (ctx.message?.text?.startsWith('/start') || ctx.session.step === 'choose_language_start') {
            ctx.session.isNeededSubscription = false;
            return next();
        }

        // if (ctx.session.isNeededSubscription) {
        //     await ctx.reply(ctx.t('not_subscribed'), {
        //         reply_markup: subscribeChannelKeyboard(ctx.t),
        //     });
        // }

        const isSubscribed = await checkSubscription(ctx, String(process.env.CHANNEL_NAME));
        if (isSubscribed) {
            if (ctx.session.isNeededSubscription) {
                await ctx.reply(ctx.t('thanks_for_subscription'), {
                    reply_markup: {
                        remove_keyboard: true
                    },
                });
            }
            ctx.session.isNeededSubscription = false;
            next();
        } else {
            ctx.session.isNeededSubscription = true;

            await ctx.reply(ctx.t('need_subscription'), {
                reply_markup: subscribeChannelKeyboard(ctx.t),
                parse_mode: "Markdown"
            });
        }
    };

    bot.use(checkSubscriptionMiddleware)



    bot.command("start", async (ctx) => {

        ctx.session.step = "choose_language_start";

        ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    });

    bot.command("language", (ctx) => {

        ctx.session.step = "choose_language";

        ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    });

    bot.on("message", async (ctx) => {
        const message = ctx.message.text;

        switch (ctx.session.step) {
            case "choose_language_start":
                const language = languages.find(i => i.name === message);
                if (language) {
                    await ctx.i18n.setLocale(language.mark || "ru");

                    ctx.session.step = "prepare_message";

                    await ctx.reply(ctx.t('lets_start'), {
                        reply_markup: prepareMessageKeyboard(ctx.t),
                    });
                } else {
                    await ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: languageKeyboard
                    });
                }

                break;

            case "prepare_message":
                if (message === ctx.t('ok_lets_start')) {
                    ctx.session.step = "accept_privacy";

                    await ctx.reply(ctx.t('privacy_message'), {
                        reply_markup: acceptPrivacyKeyboard(ctx.t),
                    });
                } else {
                    await ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: prepareMessageKeyboard(ctx.t),
                    });
                }

                break;

            case "accept_privacy":
                if (message === ctx.t('ok')) {
                    ctx.session.step = "questions";
                    ctx.session.question = 'years'

                    await ctx.reply(ctx.t('years_question'), {
                        reply_markup: ageKeyboard(ctx.session)
                    });
                } else {
                    await ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: acceptPrivacyKeyboard(ctx.t),
                    });
                }

                break;

            case "questions":
                switch (ctx.session.question) {
                    case "years":
                        const n = Number(message)
                        if (!/^\d+$/.test(message || "str")) {
                            await ctx.reply(ctx.t('type_years'), {
                                reply_markup: ageKeyboard(ctx.session)
                            });
                        } else if (n <= 8) {
                            await ctx.reply(ctx.t('type_bigger_year'), {
                                reply_markup: ageKeyboard(ctx.session)
                            });
                        } else if (n > 100) {
                            await ctx.reply(ctx.t('type_smaller_year'), {
                                reply_markup: ageKeyboard(ctx.session)
                            });
                        } else {
                            ctx.session.form.age = n;
                            ctx.session.question = "gender";

                            await ctx.reply(ctx.t('gender_question'), {
                                reply_markup: genderKeyboard(ctx.t)
                            });
                        }

                        break;

                    case "gender":
                        if (genderKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
                            ctx.session.question = "interested_in";
                            ctx.session.form.gender = message === ctx.t('i_man') ? 'male' : 'female';

                            await ctx.reply(ctx.t('interested_in_question'), {
                                reply_markup: interestedInKeyboard(ctx.t)
                            });
                        } else {
                            await ctx.reply(ctx.t('no_such_answer'), {
                                reply_markup: genderKeyboard(ctx.t)
                            });
                        }

                        break;

                    case "interested_in":
                        if (interestedInKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
                            ctx.session.question = "city";
                            ctx.session.form.interestedIn = message === ctx.t('men') ? 'male' : message === ctx.t('women') ? 'female' : "all";

                            await ctx.reply(ctx.t('city_question'), {
                                reply_markup: cityKeyboard(ctx.t, ctx.session)
                            });
                        } else {
                            await ctx.reply(ctx.t('no_such_answer'), {
                                reply_markup: interestedInKeyboard(ctx.t)
                            });
                        }

                        break;

                    case "city":
                        console.log('location', ctx.message.location)
                        if (ctx.message.location) {
                            const { latitude, longitude } = ctx.message.location;

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
                                    console.log("Ближайший город:", nearestCity.name, `(${minDistance.toFixed(2)} км)`);
                                    ctx.session.form.city = nearestCity.name
                                    ctx.session.form.location = { longitude: nearestCity.longitude, latitude: nearestCity.latitude }
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
                                    ctx.session.form.city = message || ""
                                    ctx.session.form.location = { longitude: foundCity.longitude, latitude: foundCity.latitude }
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

                        break;

                    case "name":
                        if (!message) {
                            await ctx.reply(ctx.t('type_name'), {
                                reply_markup: nameKeyboard(ctx.session)
                            });
                        } else if (message.length > 100) {
                            await ctx.reply(ctx.t('long_name'), {
                                reply_markup: nameKeyboard(ctx.session)
                            });
                        } else {
                            ctx.session.question = "text";
                            if (ctx.session.form.name) {
                                ctx.session.form.previous_name = ctx.session.form.name
                            }
                            ctx.session.form.name = message

                            await ctx.reply(ctx.t('text_question'), {
                                reply_markup: textKeyboard(ctx.t, ctx.session)
                            });
                        }

                        break;

                    case "text":
                        if (message && message.length > 1000) {
                            await ctx.reply(ctx.t('long_text'), {
                                reply_markup: textKeyboard(ctx.t, ctx.session)
                            });
                        } else if (!message || message === ctx.t('skip')) {
                            await ctx.reply(ctx.t('file_question'), {
                                reply_markup: textKeyboard(ctx.t, ctx.session)
                            });
                        } else {
                            ctx.session.question = "file";
                            ctx.session.form.text = (!message || message === ctx.t('skip')) ? "" : message

                            await ctx.reply(ctx.t('file_question'), {
                                reply_markup: textKeyboard(ctx.t, ctx.session)
                            });
                        }

                        break;
                }
                break;

            default:
                await ctx.reply(ctx.t('no_such_answer'));
        }
    });



    bot.start();
}


startBot()