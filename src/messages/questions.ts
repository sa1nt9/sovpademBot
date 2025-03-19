import { MyContext } from '../typescript/context';
import { ageKeyboard, allRightKeyboard, answerFormKeyboard, cityKeyboard, fileKeyboard, genderKeyboard, interestedInKeyboard, nameKeyboard, profileKeyboard, someFilesAddedKeyboard, textKeyboard } from "../constants/keyboards";
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { prisma } from '../db/postgres';
import { saveForm } from '../functions/db/saveForm';
import { hasLinks } from '../functions/hasLinks';
import fs from 'fs';
import { haversine } from '../functions/haversine';

export async function questionsStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    
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
                    where: { id: String(ctx.message!.from.id) },
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
                where: { id: String(ctx.message!.from.id) },
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
                    where: { id: String(ctx.message!.from.id) },
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

} 