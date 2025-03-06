import { logger } from './logger';
import { Bot, session } from "grammy";
import * as dotenv from 'dotenv';
import { languages } from "./constants/languages";
import { acceptPrivacyKeyboard, ageKeyboard, allRightKeyboard, answerFormKeyboard, cityKeyboard, disableFormKeyboard, fileKeyboard, formDisabledKeyboard, genderKeyboard, goBackKeyboard, interestedInKeyboard, languageKeyboard, nameKeyboard, notHaveFormToDeactiveKeyboard, prepareMessageKeyboard, profileKeyboard, someFilesAddedKeyboard, subscribeChannelKeyboard, textKeyboard } from "./constants/keyboards";
import fs from 'fs';
import { haversine } from "./functions/haversine";
import { sessionInitial } from "./functions/sessionInitial";
import { sendForm } from "./functions/sendForm";
import { errorHandler } from "./handlers/error";
import { i18n } from './i18n';
import { connectPostgres, prisma, postgresClient } from './db/postgres';
import { MyContext } from './typescript/context';
import { saveForm } from './functions/db/saveForm';
import { getCandidate } from './functions/db/getCandidate';
import { checkSubscriptionMiddleware } from './middlewares/checkSubscriptionMiddleware';
import { PrismaAdapter } from '@grammyjs/storage-prisma';
import { saveLike } from './functions/db/saveLike';
import { toggleUserActive } from './functions/db/toggleUserActive';


dotenv.config();


async function startBot() {
    const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));

    await connectPostgres()


    bot.catch(errorHandler);


    bot.use(async (ctx, next) => {
        ctx.logger = logger

        await next()
    })

    bot.use(
        session({
            initial: sessionInitial,
            storage: new PrismaAdapter(prisma.session),
        })
    );

    bot.use(i18n);

    bot.use(checkSubscriptionMiddleware)


    bot.command("start", async (ctx) => {
        const userId = String(ctx.message?.from.id);

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (existingUser) {
            ctx.session.step = "profile";


            await sendForm(ctx)

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.session.step = "choose_language_start";

            await ctx.reply(ctx.t('choose_language'), {
                reply_markup: languageKeyboard
            })
        }
    });

    bot.command("deactivate", async (ctx) => {
        const userId = String(ctx.message?.from.id);

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (existingUser) {
            ctx.session.step = 'disable_form'

            await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                reply_markup: disableFormKeyboard()
            })
        } else {
            ctx.session.step = "you_dont_have_form";

            await ctx.reply(ctx.t('you_dont_have_form'), {
                reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
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


            await sendForm(ctx)

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
                            ctx.logger.info({
                                nearestCity: nearestCity.name,
                                distance: `${minDistance.toFixed(2)} км`,
                                msg: "Ближайший город"
                            })
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


                    await sendForm(ctx)

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

                        await sendForm(ctx)
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


                    await sendForm(ctx)
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

                        await sendForm(ctx)
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


                    await sendForm(ctx)
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

                        await sendForm(ctx)
                        await ctx.reply(ctx.t('profile_menu'), {
                            reply_markup: profileKeyboard()
                        });
                    } else {
                        ctx.session.question = "all_right";

                        ctx.session.form.files = ctx.session.form.temp_files
                        ctx.session.form.temp_files = []
                        ctx.session.additionalFormInfo.canGoBack = false

                        await saveForm(ctx)

                        await sendForm(ctx)
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

                                await sendForm(ctx)
                                await ctx.reply(ctx.t('profile_menu'), {
                                    reply_markup: profileKeyboard()
                                });
                            } else {
                                ctx.session.question = "all_right";
                                ctx.session.form.files = ctx.session.form.temp_files
                                ctx.session.form.temp_files = []
                                await saveForm(ctx)

                                await sendForm(ctx)

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
                        reply_markup: answerFormKeyboard()
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
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })

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
        } else if (ctx.session.step === 'sleep_menu') {
            if (message === '1🚀') {
                ctx.session.step = 'search_people'
                ctx.session.question = 'years'

                await ctx.reply("✨🔍", {
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })

            } else if (message === '2') {
                ctx.session.step = 'profile';

                await sendForm(ctx)
                await ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: profileKeyboard()
                });

            } else if (message === '3') {
                ctx.session.step = 'disable_form'

                await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                    reply_markup: disableFormKeyboard()
                })

            } else if (message === '4') {
                ctx.session.step = 'friends'


                await ctx.reply(ctx.t('invite_friends_message', { bonus: 0, comeIn14Days: 0 }), {
                    reply_markup: goBackKeyboard(ctx.t)
                });
                await ctx.reply(ctx.t('invite_link_message', { link: '' }), {
                    reply_markup: goBackKeyboard(ctx.t)
                });
            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: profileKeyboard()
                });
            }
        } else if (ctx.session.step === 'friends') {
            ctx.session.step = 'sleep_menu'

            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            })
        } else if (ctx.session.step === 'disable_form') {
            if (message === '1') {
                await toggleUserActive(ctx, false)

                ctx.session.step = 'form_disabled'

                await ctx.reply(ctx.t('form_disabled_message'), {
                    reply_markup: formDisabledKeyboard(ctx.t)
                });

            } else if (message === '2') {
                ctx.session.step = 'sleep_menu';

                await ctx.reply(ctx.t('sleep_menu'), {
                    reply_markup: profileKeyboard()
                });

            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: disableFormKeyboard()
                });
            }
        } else if (ctx.session.step === 'form_disabled') {
            if (message === ctx.t("search_people")) {
                ctx.session.step = 'profile'

                await sendForm(ctx)
                await ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: profileKeyboard()
                });

            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: disableFormKeyboard()
                });
            }
        } else if (ctx.session.step === 'you_dont_have_form') {
            if (message === ctx.t('create_form')) {
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
            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
                });
            }
        } else if (ctx.session.step === 'search_people') {
            if (message === '♥️') {
                if (ctx.session.currentCandidate) {
                    await saveLike(ctx, ctx.session.currentCandidate.id, true);
                }

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })
            } else if (message === '💌/📹') {
                ctx.session.step = 'text_or_video_to_user'
                ctx.session.additionalFormInfo.awaitingLikeContent = true;

                await ctx.reply(ctx.t('text_or_video_to_user'), {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })

            } else if (message === '👎') {
                if (ctx.session.currentCandidate) {
                    await saveLike(ctx, ctx.session.currentCandidate.id, false);
                }

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })
            } else if (message === '💤') {
                ctx.session.step = 'sleep_menu'
                await ctx.reply(ctx.t('wait_somebody_to_see_your_form'))

                await ctx.reply(ctx.t('sleep_menu'), {
                    reply_markup: profileKeyboard()
                })
            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: answerFormKeyboard()
                });
            }
        } else if (ctx.session.step === 'text_or_video_to_user') {
            if (!ctx.session.currentCandidate || !ctx.session.additionalFormInfo.awaitingLikeContent) {
                ctx.session.step = 'search_people';
                await ctx.reply(ctx.t('operation_cancelled'), {
                    reply_markup: answerFormKeyboard()
                });
                const candidate = await getCandidate(ctx);
                await sendForm(ctx, candidate || null, { myForm: false });
                ctx.logger.info(candidate, 'This is new candidate')

                return;
            }

            const isVideo = ctx.message?.video;

            if (isVideo) {
                if (ctx.message.video?.duration && ctx.message.video.duration > 15) {
                    await ctx.reply(ctx.t('video_must_be_less_15'));
                    return;
                }


                await saveLike(ctx, ctx.session.currentCandidate.id, true, {
                    videoFileId: ctx.message.video?.file_id
                });
            } else if (message) {
                await saveLike(ctx, ctx.session.currentCandidate.id, true, {
                    message: message
                });
            }

            // Возвращаемся к поиску и показываем следующую анкету
            ctx.session.step = 'search_people';
            ctx.session.additionalFormInfo.awaitingLikeContent = false;

            await ctx.reply(ctx.t('like_sended_wait_for_answer'), {
                reply_markup: {
                    remove_keyboard: true
                }
            });

            await ctx.reply("✨🔍", {
                reply_markup: answerFormKeyboard()
            });
            const candidate = await getCandidate(ctx);
            await sendForm(ctx, candidate || null, { myForm: false });
            ctx.logger.info(candidate, 'This is new candidate')
        } else {
            await ctx.reply(ctx.t('no_such_answer'));
        }
    });



    bot.start();
}


startBot()