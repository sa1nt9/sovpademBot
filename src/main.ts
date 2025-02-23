import { Bot, Context, session, SessionFlavor } from "grammy";
import * as dotenv from 'dotenv';
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { languages } from "./constants/languages";
import { acceptPrivacyKeyboard, cityKeyboard, genderKeyboard, interestedInKeyboard, languageKeyboard } from "./constants/keyboards";
import fs from 'fs';
import fetch from "node-fetch";
import path from 'path';

dotenv.config();
console.log(process.env.BOT_TOKEN)

interface SessionData {
    step?: "choose_language_start" | "profile" | "prepare_message" | "choose_language" | "accept_privacy" | 'questions';
    question?: 'years' | 'gender' | 'interested_in' | 'city' | "name" | "text" | "file" | "all_right"
}

const txttojson = () => {
    const data = fs.readFileSync("./data/cities1000.txt", 'utf-8');

    // Разбиваем на строки
    const lines = data.split('\n');

    // Парсим строки в объекты
    const cities = lines.map(line => {
        const parts = line.split('\t');
        return {
            id: parts[0], // GeoNames ID
            name: parts[1], // Официальное название
            alternateNames: parts[3]?.split(','), // Альтернативные названия (массив)
            latitude: parseFloat(parts[4]), // Широта
            longitude: parseFloat(parts[5]), // Долгота
            country: parts[8] // Код страны
        };
    }).filter(city => city.name); // Убираем пустые строки

    // Сохраняем в JSON
    fs.writeFileSync('./data/cities.json', JSON.stringify(cities, null, 2), 'utf-8');

    console.log(`✅ Успешно сохранено ${cities.length} городов в cities.json`);
}


type MyContext =
    Context
    & SessionFlavor<SessionData>
    & I18nFlavor;


const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));

const i18n = new I18n<MyContext>({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});

function initial(): SessionData {
    return { step: "choose_language_start", question: 'years' };
}

bot.use(session({ initial }));

bot.use(i18n);


bot.command("start", (ctx) => {
    
    txttojson()

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
                    reply_markup: {
                        keyboard: [[ctx.t("ok_lets_start")]],
                        resize_keyboard: true,
                    },
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
                    reply_markup: {
                        keyboard: [[ctx.t("ok_lets_start")]],
                        resize_keyboard: true,
                    },
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
                        // try {
                        //     const foundCity = cities.find(city => city.name.toLowerCase() === message?.trim().toLowerCase());

                        //     if (foundCity) {
                        //         console.log('Найден город:', foundCity);
                        //         await ctx.reply(ctx.t('name_question'), {
                        //             reply_markup: {
                        //                 remove_keyboard: true
                        //             }
                        //         });
                        //     } else {
                        //         await ctx.reply(ctx.t('no_such_answer'), {
                        //             reply_markup: cityKeyboard(ctx.t)
                        //         });
                        //     }
                        // } catch (error) {
                        //     console.error('Ошибка чтения файла cities.json:', error);
                        //     await ctx.reply('Произошла ошибка при поиске города.');
                        // }
                    }

                    break;
            }
            break;

        default:
            await ctx.reply(ctx.t('no_such_answer'));
    }
});



bot.start();
