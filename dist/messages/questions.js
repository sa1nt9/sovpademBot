"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionsStep = questionsStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
const postgres_1 = require("../db/postgres");
const saveForm_1 = require("../functions/db/saveForm");
const hasLinks_1 = require("../functions/hasLinks");
const fs_1 = __importDefault(require("fs"));
const haversine_1 = require("../functions/haversine");
const candidatesEnded_1 = require("../functions/candidatesEnded");
function questionsStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const message = ctx.message.text;
        ctx.logger.info({ message, question: ctx.session.question });
        if (ctx.session.question === "years") {
            const n = Number(message);
            if (!/^\d+$/.test(message || "str")) {
                yield ctx.reply(ctx.t('type_years'), {
                    reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                });
            }
            else if (n <= 8) {
                yield ctx.reply(ctx.t('type_bigger_year'), {
                    reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                });
            }
            else if (n > 100) {
                yield ctx.reply(ctx.t('type_smaller_year'), {
                    reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                });
            }
            else {
                ctx.session.form.age = n;
                ctx.session.question = "gender";
                yield ctx.reply(ctx.t('gender_question'), {
                    reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
                });
            }
        }
        else if (ctx.session.question === "gender") {
            if ((_a = (0, keyboards_1.genderKeyboard)(ctx.t)) === null || _a === void 0 ? void 0 : _a.keyboard[0].includes(message || "")) {
                ctx.session.question = "interested_in";
                ctx.session.form.gender = message === ctx.t('i_man') ? 'male' : 'female';
                yield ctx.reply(ctx.t('interested_in_question'), {
                    reply_markup: (0, keyboards_1.interestedInKeyboard)(ctx.t)
                });
            }
            else {
                yield ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
                });
            }
        }
        else if (ctx.session.question === "interested_in") {
            if ((_b = (0, keyboards_1.interestedInKeyboard)(ctx.t)) === null || _b === void 0 ? void 0 : _b.keyboard[0].includes(message || "")) {
                ctx.session.question = "city";
                ctx.session.form.interestedIn = message === ctx.t('men') ? 'male' : message === ctx.t('women') ? 'female' : "all";
                yield ctx.reply(ctx.t('city_question'), {
                    reply_markup: (0, keyboards_1.cityKeyboard)(ctx.t, ctx.session)
                });
            }
            else {
                yield ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: (0, keyboards_1.interestedInKeyboard)(ctx.t)
                });
            }
        }
        else if (ctx.session.question === "city") {
            if (message === `${((_c = ctx.session.form) === null || _c === void 0 ? void 0 : _c.ownCoordinates) ? "📍 " : ""}${(_d = ctx.session.form) === null || _d === void 0 ? void 0 : _d.city}`) {
                ctx.session.question = "name";
                yield ctx.reply(ctx.t('name_question'), {
                    reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
                });
            }
            else if (ctx.message.location) {
                const { latitude, longitude } = ctx.message.location;
                try {
                    const cities = JSON.parse(fs_1.default.readFileSync("./data/cities.json", "utf-8"));
                    let nearestCity = null;
                    let minDistance = Infinity;
                    for (const city of cities) {
                        const distance = (0, haversine_1.haversine)(latitude, longitude, city.latitude, city.longitude);
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
                        });
                        ctx.session.form.city = nearestCity.name;
                        ctx.session.form.ownCoordinates = true;
                        ctx.session.form.location = { longitude: nearestCity.longitude, latitude: nearestCity.latitude };
                    }
                    ctx.session.question = "name";
                    yield ctx.reply(ctx.t("name_question"), {
                        reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session),
                    });
                }
                catch (error) {
                    console.error("Ошибка чтения файла cities.json:", error);
                    yield ctx.reply("Ошибка обработки данных.");
                }
            }
            else {
                try {
                    const cities = JSON.parse(fs_1.default.readFileSync("./data/cities.json", "utf-8"));
                    const normalizedMessage = message === null || message === void 0 ? void 0 : message.trim().toLowerCase();
                    const foundCity = cities.find(city => {
                        const cityNames = [city.name, ...(city.alternateNames || [])];
                        return cityNames.some(cityName => cityName.toLowerCase() === normalizedMessage);
                    });
                    if (foundCity) {
                        ctx.session.form.city = message || "";
                        ctx.session.form.ownCoordinates = false;
                        ctx.session.form.location = { longitude: foundCity.longitude, latitude: foundCity.latitude };
                        ctx.session.question = "name";
                        yield ctx.reply(ctx.t('name_question'), {
                            reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
                        });
                    }
                    else {
                        yield ctx.reply(ctx.t('no_such_city'), {
                            reply_markup: (0, keyboards_1.cityKeyboard)(ctx.t, ctx.session)
                        });
                    }
                }
                catch (error) {
                    console.error('Ошибка чтения файла cities.json:', error);
                    yield ctx.reply("error");
                }
            }
        }
        else if (ctx.session.question === "name") {
            if (!message) {
                yield ctx.reply(ctx.t('type_name'), {
                    reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
                });
            }
            else if (message.length > 100) {
                yield ctx.reply(ctx.t('long_name'), {
                    reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
                });
            }
            else {
                ctx.session.question = "text";
                if (ctx.session.form.name) {
                    ctx.session.form.previous_name = ctx.session.form.name;
                }
                ctx.session.form.name = message;
                yield ctx.reply(ctx.t('text_question'), {
                    reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
                });
            }
        }
        else if (ctx.session.question === "text") {
            if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
                ctx.session.question = "years";
                ctx.session.step = 'profile';
                ctx.session.additionalFormInfo.canGoBack = false;
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else if (message && message.length > 1000) {
                yield ctx.reply(ctx.t('long_text'), {
                    reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
                });
            }
            else if ((0, hasLinks_1.hasLinks)(message || "")) {
                yield ctx.reply(ctx.t('this_text_breaks_the_rules'), {
                    reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
                });
            }
            else {
                ctx.session.form.text = (!message || message === ctx.t('skip')) ? "" : message;
                if (ctx.session.additionalFormInfo.canGoBack) {
                    ctx.session.question = "years";
                    ctx.session.step = 'profile';
                    ctx.session.additionalFormInfo.canGoBack = false;
                    yield (0, saveForm_1.saveForm)(ctx);
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    ctx.session.question = "file";
                    const user = yield postgres_1.prisma.user.findUnique({
                        where: { id: String(ctx.message.from.id) },
                        select: { files: true },
                    });
                    const files = (user === null || user === void 0 ? void 0 : user.files) ? JSON.parse(user === null || user === void 0 ? void 0 : user.files) : [];
                    yield ctx.reply(ctx.t('file_question'), {
                        reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                    });
                }
            }
        }
        else if (ctx.session.question === "file") {
            if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
                ctx.session.form.temp_files = [];
                ctx.session.question = "years";
                ctx.session.step = 'profile';
                ctx.session.additionalFormInfo.canGoBack = false;
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                const user = yield postgres_1.prisma.user.findUnique({
                    where: { id: String(ctx.message.from.id) },
                    select: { files: true },
                });
                const files = (user === null || user === void 0 ? void 0 : user.files) ? JSON.parse(user === null || user === void 0 ? void 0 : user.files) : [];
                if (message === ctx.t("leave_current_m") && (user === null || user === void 0 ? void 0 : user.files) && files.length > 0) {
                    ctx.logger.info('leave_current_m');
                    yield (0, saveForm_1.saveForm)(ctx);
                    yield (0, sendForm_1.sendForm)(ctx);
                    ctx.session.question = "all_right";
                    ctx.logger.info({ question: ctx.session.question }, 'all_right');
                    yield ctx.reply(ctx.t('all_right_question'), {
                        reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                    });
                }
                else {
                    const isImage = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.photo;
                    const isVideo = (_f = ctx.message) === null || _f === void 0 ? void 0 : _f.video;
                    if (isVideo && ((_h = (_g = ctx.message) === null || _g === void 0 ? void 0 : _g.video) === null || _h === void 0 ? void 0 : _h.duration) && ((_k = (_j = ctx.message) === null || _j === void 0 ? void 0 : _j.video) === null || _k === void 0 ? void 0 : _k.duration) < 15) {
                        yield ctx.reply(ctx.t('video_must_be_less_15'), {
                            reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                        });
                    }
                    else if (isImage || isVideo) {
                        const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
                        ctx.session.form.temp_files = [{ type: isImage ? 'photo' : 'video', media: (file === null || file === void 0 ? void 0 : file.file_id) || '' }];
                        ctx.session.question = "add_another_file";
                        yield ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 1 }), {
                            reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
                        });
                    }
                    else {
                        yield ctx.reply(ctx.t('second_file_question'), {
                            reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                        });
                    }
                }
            }
        }
        else if (ctx.session.question === "add_another_file") {
            if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
                ctx.session.form.temp_files = [];
                ctx.session.question = "years";
                ctx.session.step = 'profile';
                ctx.session.additionalFormInfo.canGoBack = false;
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else if (message === ctx.t("its_all_save_files")) {
                if (ctx.session.additionalFormInfo.canGoBack) {
                    ctx.session.step = 'profile';
                    ctx.session.form.files = ctx.session.form.temp_files;
                    ctx.session.form.temp_files = [];
                    ctx.session.additionalFormInfo.canGoBack = false;
                    yield (0, saveForm_1.saveForm)(ctx);
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    ctx.session.question = "all_right";
                    ctx.session.form.files = ctx.session.form.temp_files;
                    ctx.session.form.temp_files = [];
                    ctx.session.additionalFormInfo.canGoBack = false;
                    yield (0, saveForm_1.saveForm)(ctx);
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('all_right_question'), {
                        reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                    });
                }
            }
            else {
                const isImage = (_l = ctx.message) === null || _l === void 0 ? void 0 : _l.photo;
                const isVideo = (_m = ctx.message) === null || _m === void 0 ? void 0 : _m.video;
                if (isVideo && ((_p = (_o = ctx.message) === null || _o === void 0 ? void 0 : _o.video) === null || _p === void 0 ? void 0 : _p.duration) && ((_r = (_q = ctx.message) === null || _q === void 0 ? void 0 : _q.video) === null || _r === void 0 ? void 0 : _r.duration) < 15) {
                    yield ctx.reply(ctx.t('video_must_be_less_15'), {
                        reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
                    });
                }
                else if (isImage || isVideo) {
                    const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
                    ctx.session.form.temp_files.push({ type: isImage ? 'photo' : 'video', media: (file === null || file === void 0 ? void 0 : file.file_id) || '' });
                    if (ctx.session.form.temp_files.length === 2) {
                        yield ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 2 }), {
                            reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
                        });
                    }
                    else {
                        if (ctx.session.additionalFormInfo.canGoBack) {
                            ctx.session.step = 'profile';
                            ctx.session.form.files = ctx.session.form.temp_files;
                            ctx.session.form.temp_files = [];
                            ctx.session.additionalFormInfo.canGoBack = false;
                            yield (0, saveForm_1.saveForm)(ctx);
                            yield (0, sendForm_1.sendForm)(ctx);
                            yield ctx.reply(ctx.t('profile_menu'), {
                                reply_markup: (0, keyboards_1.profileKeyboard)()
                            });
                        }
                        else {
                            ctx.session.question = "all_right";
                            ctx.session.form.files = ctx.session.form.temp_files;
                            ctx.session.form.temp_files = [];
                            yield (0, saveForm_1.saveForm)(ctx);
                            yield (0, sendForm_1.sendForm)(ctx);
                            yield ctx.reply(ctx.t('all_right_question'), {
                                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                            });
                        }
                    }
                }
                else {
                    const user = yield postgres_1.prisma.user.findUnique({
                        where: { id: String(ctx.message.from.id) },
                        select: { files: true },
                    });
                    const files = (user === null || user === void 0 ? void 0 : user.files) ? JSON.parse(user === null || user === void 0 ? void 0 : user.files) : [];
                    yield ctx.reply(ctx.t('second_file_question'), {
                        reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                    });
                }
            }
        }
        else if (ctx.session.question === "all_right") {
            ctx.logger.info('all_right');
            if (message === ctx.t("yes")) {
                ctx.logger.info('yes');
                ctx.session.step = 'search_people';
                ctx.session.question = 'years';
                yield ctx.reply("✨🔍", {
                    reply_markup: (0, keyboards_1.answerFormKeyboard)()
                });
                const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                ctx.logger.info(candidate, 'This is new candidate');
                if (candidate) {
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else {
                    yield (0, candidatesEnded_1.candidatesEnded)(ctx);
                }
            }
            else if (message === ctx.t('change_form')) {
                ctx.logger.info('change_form');
                ctx.session.step = 'profile';
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                yield ctx.reply(ctx.t('no_such_answer'), {
                    reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                });
            }
        }
    });
}
