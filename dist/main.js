"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const logger_1 = require("./logger");
const grammy_1 = require("grammy");
const dotenv = __importStar(require("dotenv"));
const languages_1 = require("./constants/languages");
const keyboards_1 = require("./constants/keyboards");
const fs_1 = __importDefault(require("fs"));
const haversine_1 = require("./functions/haversine");
const sessionInitial_1 = require("./functions/sessionInitial");
const sendForm_1 = require("./functions/sendForm");
const error_1 = require("./handlers/error");
const i18n_1 = require("./i18n");
const postgres_1 = require("./db/postgres");
const saveForm_1 = require("./functions/db/saveForm");
const getCandidate_1 = require("./functions/db/getCandidate");
const checkSubscriptionMiddleware_1 = require("./middlewares/checkSubscriptionMiddleware");
const storage_prisma_1 = require("@grammyjs/storage-prisma");
const saveLike_1 = require("./functions/db/saveLike");
const toggleUserActive_1 = require("./functions/db/toggleUserActive");
dotenv.config();
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        const bot = new grammy_1.Bot(String(process.env.BOT_TOKEN));
        yield (0, postgres_1.connectPostgres)();
        bot.catch(error_1.errorHandler);
        bot.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.logger = logger_1.logger;
            yield next();
        }));
        bot.use((0, grammy_1.session)({
            initial: sessionInitial_1.sessionInitial,
            storage: new storage_prisma_1.PrismaAdapter(postgres_1.prisma.session),
        }));
        bot.use(i18n_1.i18n);
        bot.use(checkSubscriptionMiddleware_1.checkSubscriptionMiddleware);
        bot.command("start", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.session.step = "profile";
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                ctx.session.step = "choose_language_start";
                yield ctx.reply(ctx.t('choose_language'), {
                    reply_markup: keyboards_1.languageKeyboard
                });
            }
        }));
        bot.command("deactivate", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.session.step = 'disable_form';
                yield ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                    reply_markup: (0, keyboards_1.disableFormKeyboard)()
                });
            }
            else {
                ctx.session.step = "you_dont_have_form";
                yield ctx.reply(ctx.t('you_dont_have_form'), {
                    reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
                });
            }
        }));
        bot.command("myprofile", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.session.step = "profile";
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                if (ctx.session.privacyAccepted) {
                    ctx.session.step = "questions";
                    ctx.session.question = 'years';
                    yield ctx.reply(ctx.t('years_question'), {
                        reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                    });
                }
                else {
                    ctx.session.step = "accept_privacy";
                    yield ctx.reply(ctx.t('privacy_message'), {
                        reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                    });
                }
            }
        }));
        bot.command("language", (ctx) => {
            ctx.session.step = "choose_language";
            ctx.reply(ctx.t('choose_language'), {
                reply_markup: keyboards_1.languageKeyboard
            });
        });
        bot.on("message", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            const message = ctx.message.text;
            if (ctx.session.step === "choose_language_start") {
                const language = languages_1.languages.find(i => i.name === message);
                if (language) {
                    yield ctx.i18n.setLocale(language.mark || "ru");
                    ctx.session.step = "prepare_message";
                    yield ctx.reply(ctx.t('lets_start'), {
                        reply_markup: (0, keyboards_1.prepareMessageKeyboard)(ctx.t),
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: keyboards_1.languageKeyboard
                    });
                }
            }
            else if (ctx.session.step === "choose_language") {
                const language = languages_1.languages.find(i => i.name === message);
                if (language) {
                    yield ctx.i18n.setLocale(language.mark || "ru");
                    ctx.session.step = "prepare_message";
                    yield ctx.reply(ctx.t('lets_start'), {
                        reply_markup: (0, keyboards_1.prepareMessageKeyboard)(ctx.t),
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: keyboards_1.languageKeyboard
                    });
                }
            }
            else if (ctx.session.step === "prepare_message") {
                if (message === ctx.t('ok_lets_start')) {
                    ctx.session.step = "accept_privacy";
                    yield ctx.reply(ctx.t('privacy_message'), {
                        reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.prepareMessageKeyboard)(ctx.t),
                    });
                }
            }
            else if (ctx.session.step === "accept_privacy") {
                if (message === ctx.t('ok')) {
                    ctx.session.privacyAccepted = true;
                    ctx.session.step = "questions";
                    ctx.session.question = 'years';
                    yield ctx.reply(ctx.t('years_question'), {
                        reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                    });
                }
            }
            else if (ctx.session.step === "questions") {
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
                    if (ctx.message.location) {
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
                        if (message === ctx.t("leave_current") && (user === null || user === void 0 ? void 0 : user.files) && files.length > 0) {
                            yield (0, saveForm_1.saveForm)(ctx);
                            yield (0, sendForm_1.sendForm)(ctx);
                            ctx.session.question = "all_right";
                            yield ctx.reply(ctx.t('all_right_question'), {
                                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                            });
                        }
                        else {
                            const isImage = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.photo;
                            const isVideo = (_d = ctx.message) === null || _d === void 0 ? void 0 : _d.video;
                            if (isVideo && ((_f = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.duration) && ((_h = (_g = ctx.message) === null || _g === void 0 ? void 0 : _g.video) === null || _h === void 0 ? void 0 : _h.duration) < 15) {
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
                        const isImage = (_j = ctx.message) === null || _j === void 0 ? void 0 : _j.photo;
                        const isVideo = (_k = ctx.message) === null || _k === void 0 ? void 0 : _k.video;
                        if (isVideo && ((_m = (_l = ctx.message) === null || _l === void 0 ? void 0 : _l.video) === null || _m === void 0 ? void 0 : _m.duration) && ((_p = (_o = ctx.message) === null || _o === void 0 ? void 0 : _o.video) === null || _p === void 0 ? void 0 : _p.duration) < 15) {
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
                    if (message === ctx.t("yes")) {
                        ctx.session.step = 'search_people';
                        ctx.session.question = 'years';
                        yield ctx.reply("✨🔍", {
                            reply_markup: (0, keyboards_1.answerFormKeyboard)()
                        });
                    }
                    else if (message === ctx.t('change_form')) {
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
            }
            else if (ctx.session.step === 'profile') {
                if (message === '1🚀') {
                    ctx.session.step = 'search_people';
                    ctx.session.question = 'years';
                    yield ctx.reply("✨🔍", {
                        reply_markup: (0, keyboards_1.answerFormKeyboard)()
                    });
                    const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                    ctx.logger.info(candidate, 'This is new candidate');
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else if (message === '2') {
                    ctx.session.step = 'questions';
                    ctx.session.question = 'years';
                    yield ctx.reply(ctx.t('years_question'), {
                        reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                    });
                }
                else if (message === '3') {
                    ctx.session.step = 'questions';
                    ctx.session.question = 'file';
                    ctx.session.additionalFormInfo.canGoBack = true;
                    yield ctx.reply(ctx.t('file_question'), {
                        reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, true)
                    });
                }
                else if (message === '4') {
                    ctx.session.step = 'questions';
                    ctx.session.question = "text";
                    ctx.session.additionalFormInfo.canGoBack = true;
                    yield ctx.reply(ctx.t('text_question'), {
                        reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
            }
            else if (ctx.session.step === 'sleep_menu') {
                if (message === '1🚀') {
                    ctx.session.step = 'search_people';
                    ctx.session.question = 'years';
                    yield ctx.reply("✨🔍", {
                        reply_markup: (0, keyboards_1.answerFormKeyboard)()
                    });
                    const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                    ctx.logger.info(candidate, 'This is new candidate');
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else if (message === '2') {
                    ctx.session.step = 'profile';
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else if (message === '3') {
                    ctx.session.step = 'disable_form';
                    yield ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                        reply_markup: (0, keyboards_1.disableFormKeyboard)()
                    });
                }
                else if (message === '4') {
                    ctx.session.step = 'friends';
                    yield ctx.reply(ctx.t('invite_friends_message', { bonus: 0, comeIn14Days: 0 }), {
                        reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
                    });
                    yield ctx.reply(ctx.t('invite_link_message', { link: '' }), {
                        reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
            }
            else if (ctx.session.step === 'friends') {
                ctx.session.step = 'sleep_menu';
                yield ctx.reply(ctx.t('sleep_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else if (ctx.session.step === 'disable_form') {
                if (message === '1') {
                    yield (0, toggleUserActive_1.toggleUserActive)(ctx, false);
                    ctx.session.step = 'form_disabled';
                    yield ctx.reply(ctx.t('form_disabled_message'), {
                        reply_markup: (0, keyboards_1.formDisabledKeyboard)(ctx.t)
                    });
                }
                else if (message === '2') {
                    ctx.session.step = 'sleep_menu';
                    yield ctx.reply(ctx.t('sleep_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.disableFormKeyboard)()
                    });
                }
            }
            else if (ctx.session.step === 'form_disabled') {
                if (message === ctx.t("search_people")) {
                    ctx.session.step = 'profile';
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.disableFormKeyboard)()
                    });
                }
            }
            else if (ctx.session.step === 'you_dont_have_form') {
                if (message === ctx.t('create_form')) {
                    if (ctx.session.privacyAccepted) {
                        ctx.session.step = "questions";
                        ctx.session.question = 'years';
                        yield ctx.reply(ctx.t('years_question'), {
                            reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                        });
                    }
                    else {
                        ctx.session.step = "accept_privacy";
                        yield ctx.reply(ctx.t('privacy_message'), {
                            reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                        });
                    }
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
                    });
                }
            }
            else if (ctx.session.step === 'search_people') {
                if (message === '♥️') {
                    if (ctx.session.currentCandidate) {
                        yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, true);
                    }
                    const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                    ctx.logger.info(candidate, 'This is new candidate');
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else if (message === '💌/📹') {
                    ctx.session.step = 'text_or_video_to_user';
                    ctx.session.additionalFormInfo.awaitingLikeContent = true;
                    yield ctx.reply(ctx.t('text_or_video_to_user'), {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }
                else if (message === '👎') {
                    if (ctx.session.currentCandidate) {
                        yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, false);
                    }
                    const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                    ctx.logger.info(candidate, 'This is new candidate');
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else if (message === '💤') {
                    ctx.session.step = 'sleep_menu';
                    yield ctx.reply(ctx.t('wait_somebody_to_see_your_form'));
                    yield ctx.reply(ctx.t('sleep_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    yield ctx.reply(ctx.t('no_such_answer'), {
                        reply_markup: (0, keyboards_1.answerFormKeyboard)()
                    });
                }
            }
            else if (ctx.session.step === 'text_or_video_to_user') {
                if (!ctx.session.currentCandidate || !ctx.session.additionalFormInfo.awaitingLikeContent) {
                    ctx.session.step = 'search_people';
                    yield ctx.reply(ctx.t('operation_cancelled'), {
                        reply_markup: (0, keyboards_1.answerFormKeyboard)()
                    });
                    const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                    ctx.logger.info(candidate, 'This is new candidate');
                    return;
                }
                const isVideo = (_q = ctx.message) === null || _q === void 0 ? void 0 : _q.video;
                if (isVideo) {
                    if (((_r = ctx.message.video) === null || _r === void 0 ? void 0 : _r.duration) && ctx.message.video.duration > 15) {
                        yield ctx.reply(ctx.t('video_must_be_less_15'));
                        return;
                    }
                    yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, true, {
                        videoFileId: (_s = ctx.message.video) === null || _s === void 0 ? void 0 : _s.file_id
                    });
                }
                else if (message) {
                    yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, true, {
                        message: message
                    });
                }
                // Возвращаемся к поиску и показываем следующую анкету
                ctx.session.step = 'search_people';
                ctx.session.additionalFormInfo.awaitingLikeContent = false;
                yield ctx.reply(ctx.t('like_sended_wait_for_answer'), {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
                yield ctx.reply("✨🔍", {
                    reply_markup: (0, keyboards_1.answerFormKeyboard)()
                });
                const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                ctx.logger.info(candidate, 'This is new candidate');
            }
            else {
                yield ctx.reply(ctx.t('no_such_answer'));
            }
        }));
        bot.start();
    });
}
startBot();
