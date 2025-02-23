import { Bot, Context, session, SessionFlavor } from "grammy";
import * as dotenv from 'dotenv';
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { languages } from "./constants/languages";
import { acceptPrivacyKeyboard, cityKeyboard, genderKeyboard, interestedInKeyboard, languageKeyboard, prepareMessageKeyboard, skipKeyboard } from "./constants/keyboards";
import fs from 'fs';
import { PsqlAdapter } from '@grammyjs/storage-psql';
import { Client } from "pg";
import { ISessionData } from "./typescript/interfaces/ISessionData";

dotenv.config();
console.log(process.env.BOT_TOKEN)


type MyContext =
    Context
    & SessionFlavor<ISessionData>
    & I18nFlavor;


const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));


const i18n = new I18n<MyContext>({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});

function initial(): ISessionData {
    return { step: "choose_language_start", question: 'years' };
}

async function startBot() {
    const client = new Client({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: process.env.POSTGRES_USERNAME || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'root',
        database: process.env.POSTGRES_NAME || 'postgres',
    });

    await client.connect();

    bot.use(
        session({
            initial,
            storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
        })
    );

    bot.use(i18n);


    bot.command("start", (ctx) => {

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
                        reply_markup: {
                            remove_keyboard: true,
                        },
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
                        console.log(await ctx.i18n.getLocale())
                        const n = Number(message)
                        if (!/^\d+$/.test(message || "str")) {
                            await ctx.reply(ctx.t('type_years'), {
                                reply_markup: {
                                    remove_keyboard: true
                                },
                            });
                        } else if (n <= 8) {
                            await ctx.reply(ctx.t('type_bigger_year'), {
                                reply_markup: {
                                    remove_keyboard: true
                                },
                            });
                        } else if (n > 100) {
                            await ctx.reply(ctx.t('type_smaller_year'), {
                                reply_markup: {
                                    remove_keyboard: true
                                },
                            });
                        } else {
                            ctx.session.question = "gender";

                            await ctx.reply(ctx.t('gender_question'), {
                                reply_markup: genderKeyboard(ctx.t)
                            });
                        }

                        break;

                    case "gender":
                        console.log(await ctx.i18n.getLocale())
                        if (genderKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
                            ctx.session.question = "interested_in";

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

                            await ctx.reply(ctx.t('city_question'), {
                                reply_markup: cityKeyboard(ctx.t)
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
                            ctx.session.question = "name";


                            await ctx.reply(ctx.t('name_question'), {
                                reply_markup: {
                                    remove_keyboard: true
                                }
                            });
                        } else {
                            try {
                                const cities: any[] = JSON.parse(fs.readFileSync("./data/cities.json", "utf-8"));
                                const normalizedMessage = message?.trim().toLowerCase();

                                const foundCity = cities.find(city => {
                                    const cityNames = [city.name, ...(city.alternateNames || [])];
                                    return cityNames.some(cityName => cityName.toLowerCase() === normalizedMessage);
                                });

                                if (foundCity) {
                                    ctx.session.question = "name";
                                    await ctx.reply(ctx.t('name_question'), {
                                        reply_markup: { remove_keyboard: true }
                                    });
                                } else {
                                    await ctx.reply(ctx.t('no_such_city'), {
                                        reply_markup: cityKeyboard(ctx.t)
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
                                reply_markup: { remove_keyboard: true }
                            });
                        } else if (message.length > 100) {
                            await ctx.reply(ctx.t('long_name'), {
                                reply_markup: { remove_keyboard: true }
                            });
                        } else {
                            ctx.session.question = "text";

                            await ctx.reply(ctx.t('text_question'), {
                                reply_markup: skipKeyboard(ctx.t)
                            });
                        }

                        break;

                    case "name":
                        if (!message) {
                            await ctx.reply(ctx.t('type_name'), {
                                reply_markup: { remove_keyboard: true }
                            });
                        } else if (message.length > 100) {
                            await ctx.reply(ctx.t('long_name'), {
                                reply_markup: { remove_keyboard: true }
                            });
                        } else {
                            ctx.session.question = "text";

                            await ctx.reply(ctx.t('text_question'), {
                                reply_markup: skipKeyboard(ctx.t)
                            });
                        }

                        break;

                    case "text":
                        if (message && message.length > 1000) {
                            await ctx.reply(ctx.t('long_text'), {
                                reply_markup: skipKeyboard(ctx.t)
                            });
                        } else if (!message || message === ctx.t('skip')) {
                            await ctx.reply(ctx.t('file_question'), {
                                reply_markup: skipKeyboard(ctx.t)
                            });
                        } else {
                            ctx.session.question = "file";

                            await ctx.reply(ctx.t('file_question'), {
                                reply_markup: skipKeyboard(ctx.t)
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