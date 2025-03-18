import { logger } from './logger';
import { Bot, session } from "grammy";
import * as dotenv from 'dotenv';
import { languages } from "./constants/languages";
import { acceptPrivacyKeyboard, ageKeyboard, allRightKeyboard, answerFormKeyboard, answerLikesFormKeyboard, cityKeyboard, continueSeeFormsKeyboard, disableFormKeyboard, fileKeyboard, formDisabledKeyboard, genderKeyboard, goBackKeyboard, interestedInKeyboard, inviteFriendsKeyboard, languageKeyboard, nameKeyboard, notHaveFormToDeactiveKeyboard, prepareMessageKeyboard, profileKeyboard, somebodysLikedYouKeyboard, someFilesAddedKeyboard, subscribeChannelKeyboard, textKeyboard, complainKeyboard } from "./constants/keyboards";
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
import { encodeId, decodeId } from './functions/encodeId';
import { sendLikesNotification } from './functions/sendLikesNotification';
import { getOneLike } from './functions/db/getOneLike';
import { setMutualLike } from './functions/db/setMutualLike';
import { myprofileCommand } from './commands/myprofile';
import { languageCommand } from './commands/language';
import { deactivateCommand } from './commands/deactivate';
import { startCommand } from './commands/start';
import { complainCommand } from './commands/complain';
import { hasLinks } from './functions/hasLinks';


dotenv.config();

export const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));


async function startBot() {

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


    bot.command("start", startCommand);

    bot.command("deactivate", deactivateCommand);

    bot.command("complain", complainCommand);

    bot.command("myprofile", myprofileCommand);

    bot.command("language", languageCommand);


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
                if (message === `${ctx.session.form?.ownCoordinates ? "📍 " : ""}${ctx.session.form?.city}`) {
                    ctx.session.question = "name";

                    await ctx.reply(ctx.t('name_question'), {
                        reply_markup: nameKeyboard(ctx.session)
                    });
                } else if (ctx.message.location) {
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
                }  else if (hasLinks(message || "")) {
                    await ctx.reply(ctx.t('this_text_breaks_the_rules'), {
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

                    const candidate = await getCandidate(ctx)
                    ctx.logger.info(candidate, 'This is new candidate')

                    await sendForm(ctx, candidate || null, { myForm: false })

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

                const encodedId = encodeId(String(ctx.message.from.id));
                const url = `https://t.me/${process.env.BOT_USERNAME}?start=i_${encodedId}`;
                const text = `${ctx.t('invite_link_message', { botname: process.env.CHANNEL_NAME || "" })}`

                const now = new Date();
                const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

                const comeIn14Days = await prisma.user.count({
                    where: {
                        referrerId: String(ctx.message.from.id),
                        createdAt: {
                            gte: fourteenDaysAgo
                        }
                    }
                })
                const comeInAll = await prisma.user.count({
                    where: {
                        referrerId: String(ctx.message.from.id)
                    }
                })
                const bonus = Math.min(comeIn14Days * 10 + (comeInAll - comeIn14Days) * 5, 100)

                await ctx.reply(ctx.t('invite_friends_message', { bonus, comeIn14Days, comeInAll }), {
                    reply_markup: goBackKeyboard(ctx.t),
                });

                const inviteLinkText =
                    `${ctx.t('invite_link_message', { botname: process.env.CHANNEL_NAME || "" })}
👉 ${url}`
                await ctx.reply(inviteLinkText, {
                    reply_markup: inviteFriendsKeyboard(ctx.t, url, text),
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
        } else if (ctx.session.step === 'cannot_send_complain') {
            const existingUser = await prisma.user.findUnique({
                where: { id: String(ctx.message.from.id) },
            });

            if (existingUser) {
                ctx.session.step = 'search_people'

                await ctx.reply("✨🔍", {
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })
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
        } else if (ctx.session.step === 'search_people') {
            if (message === '❤️') {
                if (ctx.session.currentCandidate) {
                    await saveLike(ctx, ctx.session.currentCandidate.id, true);
                    await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
                }

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })

            } else if (message === '💌/📹') {
                ctx.session.step = 'text_or_video_to_user'
                ctx.session.additionalFormInfo.awaitingLikeContent = true;

                await ctx.reply(ctx.t('text_or_video_to_user'), {
                    reply_markup: goBackKeyboard(ctx.t, true)
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
        } else if (ctx.session.step === 'search_people_with_likes') {
            if (message === '❤️') {
                if (ctx.session.currentCandidate) {
                    ctx.logger.info(ctx.session.currentCandidate, 'Candidate to set mutual like')

                    await setMutualLike(ctx.session.currentCandidate.id, String(ctx.from.id));
                    await saveLike(ctx, ctx.session.currentCandidate.id, true, { isMutual: true });

                    const userInfo = await bot.api.getChat(ctx.session.currentCandidate.id);

                    await sendLikesNotification(ctx, ctx.session.currentCandidate.id, true)

                    ctx.session.step = 'continue_see_likes_forms'

                    await ctx.reply(`${ctx.t('good_mutual_sympathy')} [${ctx.session.currentCandidate.name}](https://t.me/${userInfo.username})`, {
                        parse_mode: 'Markdown',
                        reply_markup: continueSeeFormsKeyboard(ctx.t)
                    });
                }

            } else if (message === '👎') {
                if (ctx.session.currentCandidate) {
                    await saveLike(ctx, ctx.session.currentCandidate.id, false);

                    const oneLike = await getOneLike(String(ctx.from.id));

                    if (oneLike?.user) {
                        await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
                    } else {
                        ctx.session.step = 'continue_see_forms'
                        ctx.session.additionalFormInfo.searchingLikes = false

                        await ctx.reply(ctx.t('its_all_go_next_question'), {
                            reply_markup: continueSeeFormsKeyboard(ctx.t)
                        });
                    }

                }


            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: answerLikesFormKeyboard()
                });
            }
        } else if (ctx.session.step === 'continue_see_forms') {
            ctx.session.step = 'search_people'
            ctx.session.question = 'years'

            await ctx.reply("✨🔍", {
                reply_markup: answerFormKeyboard()
            });

            const candidate = await getCandidate(ctx)
            ctx.logger.info(candidate, 'This is new candidate')

            await sendForm(ctx, candidate || null, { myForm: false })

        } else if (ctx.session.step === 'continue_see_likes_forms') {
            ctx.session.step = 'search_people_with_likes'
            ctx.session.additionalFormInfo.searchingLikes = true

            const oneLike = await getOneLike(String(ctx.from.id));

            
            if (oneLike?.user) {
                await ctx.reply("✨🔍", {
                    reply_markup: answerLikesFormKeyboard()
                });

                await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
            } else {
                ctx.session.step = 'search_people'
                ctx.session.additionalFormInfo.searchingLikes = false

                await ctx.reply("✨🔍", {
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })
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
            if (message === ctx.t('go_back')) {
                ctx.session.step = 'search_people'
                ctx.session.question = 'years'
                ctx.session.additionalFormInfo.awaitingLikeContent = false;

                await ctx.reply("✨🔍", {
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx)
                ctx.logger.info(candidate, 'This is new candidate')

                await sendForm(ctx, candidate || null, { myForm: false })

                return
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

                await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
            } else if (message) {
                await saveLike(ctx, ctx.session.currentCandidate.id, true, {
                    message: message
                });

                await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
            } else {
                await ctx.reply(ctx.t('not_message_and_not_video'));
            }

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

        } else if (ctx.session.step === 'somebodys_liked_you') {
            if (message === '1 👍') {
                ctx.session.step = 'search_people_with_likes'
                ctx.session.additionalFormInfo.searchingLikes = true

                const oneLike = await getOneLike(String(ctx.from.id));

                ctx.session.currentCandidate = oneLike?.user

                await ctx.reply("✨🔍", {
                    reply_markup: answerLikesFormKeyboard()
                });

                if (oneLike?.user) {
                    await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
                }

            } else if (message === '2 💤') {
                ctx.session.step = 'disable_form'

                await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                    reply_markup: disableFormKeyboard()
                })
            } else {
                await ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: somebodysLikedYouKeyboard()
                });
            }
        } else if (ctx.session.step === 'complain') {
            // Обработка выбора типа жалобы
            if (message === '1 🔞') {
                ctx.session.additionalFormInfo.reportType = 'adult_content';
                ctx.session.step = 'complain_text';

                await ctx.reply(ctx.t('write_complain_comment'), {
                    reply_markup: goBackKeyboard(ctx.t)
                });
            } else if (message === '2 💰') {
                ctx.session.additionalFormInfo.reportType = 'sale';
                ctx.session.step = 'complain_text';

                await ctx.reply(ctx.t('write_complain_comment'), {
                    reply_markup: goBackKeyboard(ctx.t)
                });
            } else if (message === '3 💩') {
                ctx.session.additionalFormInfo.reportType = 'dislike';
                ctx.session.step = 'complain_text';

                await ctx.reply(ctx.t('write_complain_comment'), {
                    reply_markup: goBackKeyboard(ctx.t)
                });
            } else if (message === '4 🦨') {
                ctx.session.additionalFormInfo.reportType = 'other';
                ctx.session.step = 'complain_text';

                await ctx.reply(ctx.t('write_complain_comment'), {
                    reply_markup: goBackKeyboard(ctx.t)
                });
            } else if (message === '9') {
                ctx.session.step = 'search_people';

                await ctx.reply("✨🔍", {
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx);
                await sendForm(ctx, candidate || null, { myForm: false });
            } else {
                await ctx.reply(ctx.t('complain_text'), {
                    reply_markup: complainKeyboard()
                });
            }
        } else if (ctx.session.step === 'complain_text') {
            // Сохранение жалобы с комментарием в базу данных
            if (message === ctx.t('back')) {
                // Возврат к выбору типа жалобы
                ctx.session.step = 'complain';
                ctx.session.additionalFormInfo.reportType = undefined;

                await ctx.reply(ctx.t('complain_text'), {
                    reply_markup: complainKeyboard()
                });

                return;
            }

            try {
                if (ctx.session.additionalFormInfo.reportType && ctx.session.currentCandidate) {
                    // Создаем запись о жалобе в базе данных
                    await prisma.report.create({
                        data: {
                            reporterId: String(ctx.from?.id),
                            targetId: ctx.session.currentCandidate?.id,
                            type: ctx.session.additionalFormInfo.reportType as any,
                            text: message || undefined
                        }
                    });
                    await saveLike(ctx, ctx.session.currentCandidate.id, false);

                    // Очищаем данные о жалобе в сессии
                    ctx.session.additionalFormInfo.reportType = undefined;

                    // Информируем пользователя о принятии жалобы
                    await ctx.reply(ctx.t('complain_will_be_examined'));

                }
                if (ctx.session.additionalFormInfo.searchingLikes) {
                    ctx.session.step = 'search_people_with_likes'

                    const oneLike = await getOneLike(String(ctx.from.id));


                    await ctx.reply("✨🔍", {
                        reply_markup: answerLikesFormKeyboard()
                    });

                    if (oneLike?.user) {
                        ctx.session.currentCandidate = oneLike?.user
                        await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
                    }
                } else {
                    ctx.session.step = 'search_people';

                    await ctx.reply("✨🔍", {
                        reply_markup: answerFormKeyboard()
                    });

                    const candidate = await getCandidate(ctx);
                    await sendForm(ctx, candidate || null, { myForm: false });
                }
            } catch (error) {
                ctx.logger.error(error, 'Error saving report');

                // В случае ошибки возвращаемся к просмотру анкет
                ctx.session.step = 'search_people';

                await ctx.reply("✨🔍", {
                    reply_markup: answerFormKeyboard()
                });

                const candidate = await getCandidate(ctx);
                await sendForm(ctx, candidate || null, { myForm: false });
            }
        } else {
            await ctx.reply(ctx.t('no_such_answer'));
        }
    });



    bot.start();
}


startBot()