import { Logger, logger } from './logger';
import { Bot, BotError, Context, ErrorHandler, session, SessionFlavor } from "grammy";
import * as dotenv from 'dotenv';
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { languages } from "./constants/languages";
import { acceptPrivacyKeyboard, ageKeyboard, allRightKeyboard, cityKeyboard, fileKeyboard, genderKeyboard, interestedInKeyboard, languageKeyboard, nameKeyboard, prepareMessageKeyboard, profileKeyboard, someFilesAddedKeyboard, subscribeChannelKeyboard, textKeyboard } from "./constants/keyboards";
import fs from 'fs';
import { ISessionData } from "./typescript/interfaces/ISessionData";
import { haversine } from "./functions/haversine";
import { checkSubscription } from "./functions/checkSubscription";
import { sessionInitial } from "./functions/sessionInitial";
import { PrismaClient, User } from "@prisma/client";
import { sendForm } from "./functions/sendForm";
import Redis from "ioredis";
import { RedisAdapter } from "@grammyjs/storage-redis";
import { errorHandler } from "./handlers/error";
import { i18n } from './i18n';



dotenv.config();
console.log(process.env.BOT_TOKEN)


interface LoggerFravor {
    logger: Logger
}

export type MyContext =
    Context
    & SessionFlavor<ISessionData>
    & I18nFlavor
    & LoggerFravor;




async function startBot() {
    const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));


    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: "123456",
    });

    
    bot.catch(errorHandler);

    bot.use(async (ctx, next) => {
        ctx.logger = logger.child({
            update_id: ctx.update.update_id,
        })

        await next()
    })


    bot.use(
        session({
            initial: sessionInitial,
            storage: new RedisAdapter({ instance: redis })
        })
    );


    async function saveForm(ctx: MyContext) {
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

                console.log('Данные пользователя обновлены:', updatedUser);
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
                        latitude: userData.location.latitude,
                        text: userData.text || "",
                        files: JSON.stringify(userData.files || []),
                        ownCoordinates: userData.ownCoordinates
                    },
                });

                console.log('Новый пользователь сохранен:', newUser);
                return newUser;
            }
        } catch (error) {
            console.error('Ошибка при сохранении пользователя:', error);
        }
    }

    async function getCandidate(ctx: MyContext) {
        const userId = String(ctx.message?.from.id)

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { latitude: true, longitude: true, gender: true, interestedIn: true }
        });

        if (user) {
            const candidates: User[] = await prisma.$queryRaw`
                SELECT * FROM "User"
                WHERE "id" <> ${userId}
                    AND "id" NOT IN (
                        SELECT "targetId" FROM "UserLike" WHERE "userId" = ${userId}
                    )
                    AND (
                        CASE 
                            WHEN ${user.interestedIn} = 'all' THEN TRUE
                            ELSE "gender"::text = ${user.interestedIn}
                        END
                    )
                    AND (
                        CASE 
                            WHEN ${user.interestedIn} = 'all' THEN TRUE
                            ELSE "interestedIn"::text = ${user.gender}
                        END
                    )

                ORDER BY (
                    6371 * acos(
                        cos(radians(${user.latitude})) * cos(radians("latitude")) *
                        cos(radians("longitude") - radians(${user.longitude})) +
                        sin(radians(${user.latitude})) * sin(radians("latitude"))
                    )
                ) ASC
                LIMIT 1;
            `;

            return candidates[0]
        }

    }


    bot.use(i18n);

    const checkSubscriptionMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
        if (ctx.message?.text?.startsWith('/start') || ctx.session.step === 'choose_language_start') {
            ctx.session.isNeededSubscription = false;
            await next();
            return
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
            await next();
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
        const userId = String(ctx.message?.from.id);

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (existingUser) {
            ctx.session.step = "profile";

            const user = await prisma.user.findUnique({
                where: { id: String(ctx.message?.from.id) },
            });

            await sendForm(ctx, user)

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.session.step = "choose_language_start";

            ctx.reply(ctx.t('choose_language'), {
                reply_markup: languageKeyboard
            })
        }
    });

    bot.command("myprofile", async (ctx) => {
        const userId = String(ctx.message?.from.id);

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (existingUser) {
            ctx.session.step = "profile";

            const user = await prisma.user.findUnique({
                where: { id: String(ctx.message?.from.id) },
            });

            await sendForm(ctx, user)

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            if (ctx.session.privacyAccepted) {
                ctx.session.step = "questions";
                ctx.session.question = 'years'

                await ctx.reply(ctx.t('years_question'), {
                    reply_markup: ageKeyboard(ctx.session)
                });
            } else {
                ctx.session.step = "accept_privacy";

                await ctx.reply(ctx.t('privacy_message'), {
                    reply_markup: acceptPrivacyKeyboard(ctx.t),
                });
            }
        }
    });

    bot.command("language", (ctx) => {

        ctx.session.step = "choose_language";

        ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    });

    bot.on("message", async (ctx) => {
        const message = ctx.message.text;

        if (ctx.session.step === "choose_language_start") {
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

        } else if (ctx.session.step === "choose_language") {
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

        } else if (ctx.session.step === "prepare_message") {

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

        } else if (ctx.session.step === "accept_privacy") {
            if (message === ctx.t('ok')) {
                ctx.session.privacyAccepted = true;
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
        } else if (ctx.session.step === "questions") {

            if (ctx.session.question === "years") {
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
            } else if (ctx.session.question === "gender") {
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

            } else if (ctx.session.question === "interested_in") {
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

            } else if (ctx.session.question === "city") {
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
                            ctx.session.form.ownCoordinates = true
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
                            ctx.session.form.ownCoordinates = false
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

            } else if (ctx.session.question === "name") {
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

            } else if (ctx.session.question === "text") {
                if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
                    ctx.session.question = "years";
                    ctx.session.step = 'profile'
                    ctx.session.additionalFormInfo.canGoBack = false

                    const user = await prisma.user.findUnique({
                        where: { id: String(ctx.message?.from.id) },
                    });

                    await sendForm(ctx, user)

                    await ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: profileKeyboard()
                    });
                } else if (message && message.length > 1000) {
                    await ctx.reply(ctx.t('long_text'), {
                        reply_markup: textKeyboard(ctx.t, ctx.session)
                    });
                } else {
                    ctx.session.form.text = (!message || message === ctx.t('skip')) ? "" : message;
                    if (ctx.session.additionalFormInfo.canGoBack) {
                        ctx.session.question = "years";
                        ctx.session.step = 'profile'
                        ctx.session.additionalFormInfo.canGoBack = false

                        await saveForm(ctx)
                        const user = await prisma.user.findUnique({
                            where: { id: String(ctx.message?.from.id) },
                        });

                        await sendForm(ctx, user)
                        await ctx.reply(ctx.t('profile_menu'), {
                            reply_markup: profileKeyboard()
                        });
                    } else {
                        ctx.session.question = "file";
                        const user = await prisma.user.findUnique({
                            where: { id: String(ctx.message.from.id) },
                            select: { files: true },
                        });
                        const files = user?.files ? JSON.parse(user?.files as any) : []

                        await ctx.reply(ctx.t('file_question'), {
                            reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                        });
                    }
                }

            } else if (ctx.session.question === "file") {
                if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
                    ctx.session.form.temp_files = [];
                    ctx.session.question = "years";
                    ctx.session.step = 'profile'
                    ctx.session.additionalFormInfo.canGoBack = false

                    const user = await prisma.user.findUnique({
                        where: { id: String(ctx.message?.from.id) },
                    });

                    await sendForm(ctx, user)
                    await ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: profileKeyboard()
                    });
                } else {
                    const user = await prisma.user.findUnique({
                        where: { id: String(ctx.message.from.id) },
                        select: { files: true },
                    });
                    const files = user?.files ? JSON.parse(user?.files as any) : []

                    if (message === ctx.t("leave_current") && user?.files && files.length > 0) {
                        await saveForm(ctx)
                        const user = await prisma.user.findUnique({
                            where: { id: String(ctx.message?.from.id) },
                        });

                        await sendForm(ctx, user)
                        ctx.session.question = "all_right";


                        await ctx.reply(ctx.t('all_right_question'), {
                            reply_markup: allRightKeyboard(ctx.t)
                        });
                    } else {
                        const isImage = ctx.message?.photo;
                        const isVideo = ctx.message?.video
                        if (isVideo && ctx.message?.video?.duration && ctx.message?.video?.duration < 15) {
                            await ctx.reply(ctx.t('video_must_be_less_15'), {
                                reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                            });
                        } else if (isImage || isVideo) {
                            const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;

                            ctx.session.form.temp_files = [{ type: isImage ? 'photo' : 'video', media: file?.file_id || '' }];
                            ctx.session.question = "add_another_file";

                            await ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 1 }), {
                                reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                            });
                        } else {
                            await ctx.reply(ctx.t('second_file_question'), {
                                reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                            });
                        }
                    }
                }

            } else if (ctx.session.question === "add_another_file") {
                if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
                    ctx.session.form.temp_files = [];
                    ctx.session.question = "years";
                    ctx.session.step = 'profile'
                    ctx.session.additionalFormInfo.canGoBack = false

                    const user = await prisma.user.findUnique({
                        where: { id: String(ctx.message?.from.id) },
                    });

                    await sendForm(ctx, user)
                    await ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: profileKeyboard()
                    });
                } else if (message === ctx.t("its_all_save_files")) {
                    if (ctx.session.additionalFormInfo.canGoBack) {
                        ctx.session.step = 'profile'
                        ctx.session.form.files = ctx.session.form.temp_files
                        ctx.session.form.temp_files = []
                        ctx.session.additionalFormInfo.canGoBack = false

                        await saveForm(ctx)
                        const user = await prisma.user.findUnique({
                            where: { id: String(ctx.message?.from.id) },
                        });

                        await sendForm(ctx, user)
                        await ctx.reply(ctx.t('profile_menu'), {
                            reply_markup: profileKeyboard()
                        });
                    } else {
                        ctx.session.question = "all_right";

                        ctx.session.form.files = ctx.session.form.temp_files
                        ctx.session.form.temp_files = []
                        ctx.session.additionalFormInfo.canGoBack = false

                        await saveForm(ctx)
                        const user = await prisma.user.findUnique({
                            where: { id: String(ctx.message?.from.id) },
                        });

                        await sendForm(ctx, user)
                        await ctx.reply(ctx.t('all_right_question'), {
                            reply_markup: allRightKeyboard(ctx.t)
                        });
                    }
                } else {
                    const isImage = ctx.message?.photo;
                    const isVideo = ctx.message?.video;
                    if (isVideo && ctx.message?.video?.duration && ctx.message?.video?.duration < 15) {
                        await ctx.reply(ctx.t('video_must_be_less_15'), {
                            reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                        });
                    } else if (isImage || isVideo) {
                        const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;

                        ctx.session.form.temp_files.push({ type: isImage ? 'photo' : 'video', media: file?.file_id || '' });

                        if (ctx.session.form.temp_files.length === 2) {
                            await ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 2 }), {
                                reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                            });
                        } else {
                            if (ctx.session.additionalFormInfo.canGoBack) {
                                ctx.session.step = 'profile'
                                ctx.session.form.files = ctx.session.form.temp_files
                                ctx.session.form.temp_files = []
                                ctx.session.additionalFormInfo.canGoBack = false

                                await saveForm(ctx)
                                const user = await prisma.user.findUnique({
                                    where: { id: String(ctx.message?.from.id) },
                                });

                                await sendForm(ctx, user)
                                await ctx.reply(ctx.t('profile_menu'), {
                                    reply_markup: profileKeyboard()
                                });
                            } else {
                                ctx.session.question = "all_right";
                                ctx.session.form.files = ctx.session.form.temp_files
                                ctx.session.form.temp_files = []
                                await saveForm(ctx)
                                const user = await prisma.user.findUnique({
                                    where: { id: String(ctx.message?.from.id) },
                                });

                                await sendForm(ctx, user)

                                await ctx.reply(ctx.t('all_right_question'), {
                                    reply_markup: allRightKeyboard(ctx.t)
                                });
                            }
                        }

                    } else {
                        const user = await prisma.user.findUnique({
                            where: { id: String(ctx.message.from.id) },
                            select: { files: true },
                        });
                        const files = user?.files ? JSON.parse(user?.files as any) : []

                        await ctx.reply(ctx.t('second_file_question'), {
                            reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                        });
                    }
                }

            } else if (ctx.session.question === "all_right") {
                if (message === ctx.t("yes")) {
                    ctx.session.step = 'search_people'
                    ctx.session.question = 'years'

                    await ctx.reply("✨🔍", {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });

                } else if (message === ctx.t('change_form')) {
                    ctx.session.step = 'profile'

                    await ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: profileKeyboard()
                    });

                } else {
                    await ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: allRightKeyboard(ctx.t)
                    });
                }
            }

        } else if (ctx.session.step === 'profile') {
            if (message === '1🚀') {
                ctx.session.step = 'search_people'
                ctx.session.question = 'years'

                await ctx.reply("✨🔍", {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });

                const candidate = await getCandidate(ctx)
                console.log(candidate)

                await sendForm(ctx, candidate || null, { notSendThisIs: true })
            } else if (message === '2') {
                ctx.session.step = 'questions'
                ctx.session.question = 'years'

                await ctx.reply(ctx.t('years_question'), {
                    reply_markup: ageKeyboard(ctx.session)
                });

            } else if (message === '3') {
                ctx.session.step = 'questions'
                ctx.session.question = 'file'
                ctx.session.additionalFormInfo.canGoBack = true

                await ctx.reply(ctx.t('file_question'), {
                    reply_markup: fileKeyboard(ctx.t, ctx.session, true)
                });

            } else if (message === '4') {
                ctx.session.step = 'questions'
                ctx.session.question = "text";
                ctx.session.additionalFormInfo.canGoBack = true

                await ctx.reply(ctx.t('text_question'), {
                    reply_markup: textKeyboard(ctx.t, ctx.session)
                });
            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: profileKeyboard()
                });
            }
        } else {
            await ctx.reply(ctx.t('no_such_answer'));
        }
    });



    bot.start();
}


startBot()