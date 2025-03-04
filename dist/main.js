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
const grammy_1 = require("grammy");
const dotenv = __importStar(require("dotenv"));
const i18n_1 = require("@grammyjs/i18n");
const languages_1 = require("./constants/languages");
const keyboards_1 = require("./constants/keyboards");
const fs_1 = __importDefault(require("fs"));
const pg_1 = require("pg");
const haversine_1 = require("./functions/haversine");
const checkSubscription_1 = require("./functions/checkSubscription");
const sessionInitial_1 = require("./functions/sessionInitial");
const client_1 = require("@prisma/client");
const sendForm_1 = require("./functions/sendForm");
const ioredis_1 = __importDefault(require("ioredis"));
const storage_redis_1 = require("@grammyjs/storage-redis");
const error_1 = require("./handlers/error");
dotenv.config();
console.log(process.env.BOT_TOKEN);
const i18n = new i18n_1.I18n({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        const bot = new grammy_1.Bot(String(process.env.BOT_TOKEN));
        const client = new pg_1.Client({
            host: process.env.POSTGRES_HOST || 'localhost',
            port: Number(process.env.POSTGRES_PORT) || 5432,
            user: process.env.POSTGRES_USERNAME || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'root',
            database: process.env.POSTGRES_NAME || 'postgres',
        });
        const prisma = new client_1.PrismaClient();
        yield client.connect();
        const redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: "123456",
        });
        bot.use((0, grammy_1.session)({
            initial: sessionInitial_1.sessionInitial,
            storage: new storage_redis_1.RedisAdapter({ instance: redis })
        }));
        function saveForm(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const userData = ctx.session.form;
                    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
                    const existingUser = yield prisma.user.findUnique({
                        where: { id: userId },
                    });
                    if (existingUser) {
                        const updatedUser = yield prisma.user.update({
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
                    }
                    else {
                        const newUser = yield prisma.user.create({
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
                }
                catch (error) {
                    console.error('Ошибка при сохранении пользователя:', error);
                }
            });
        }
        function getCandidate(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
                const user = yield prisma.user.findUnique({
                    where: { id: userId },
                    select: { latitude: true, longitude: true, gender: true, interestedIn: true }
                });
                if (user) {
                    const candidates = yield prisma.$queryRaw `
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
                    return candidates[0];
                }
            });
        }
        bot.use(i18n);
        const checkSubscriptionMiddleware = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.startsWith('/start')) || ctx.session.step === 'choose_language_start') {
                ctx.session.isNeededSubscription = false;
                yield next();
                return;
            }
            // if (ctx.session.isNeededSubscription) {
            //     await ctx.reply(ctx.t('not_subscribed'), {
            //         reply_markup: subscribeChannelKeyboard(ctx.t),
            //     });
            // }
            const isSubscribed = yield (0, checkSubscription_1.checkSubscription)(ctx, String(process.env.CHANNEL_NAME));
            if (isSubscribed) {
                if (ctx.session.isNeededSubscription) {
                    yield ctx.reply(ctx.t('thanks_for_subscription'), {
                        reply_markup: {
                            remove_keyboard: true
                        },
                    });
                }
                ctx.session.isNeededSubscription = false;
                yield next();
            }
            else {
                ctx.session.isNeededSubscription = true;
                yield ctx.reply(ctx.t('need_subscription'), {
                    reply_markup: (0, keyboards_1.subscribeChannelKeyboard)(ctx.t),
                    parse_mode: "Markdown"
                });
            }
        });
        bot.use(checkSubscriptionMiddleware);
        bot.erro(error_1.errorHandler);
        bot.command("start", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.session.step = "profile";
                const user = yield prisma.user.findUnique({
                    where: { id: String((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.from.id) },
                });
                yield (0, sendForm_1.sendForm)(ctx, user);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                ctx.session.step = "choose_language_start";
                ctx.reply(ctx.t('choose_language'), {
                    reply_markup: keyboards_1.languageKeyboard
                });
            }
        }));
        bot.command("myprofile", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.session.step = "profile";
                const user = yield prisma.user.findUnique({
                    where: { id: String((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.from.id) },
                });
                yield (0, sendForm_1.sendForm)(ctx, user);
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
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
                                console.log("Ближайший город:", nearestCity.name, `(${minDistance.toFixed(2)} км)`);
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
                        const user = yield prisma.user.findUnique({
                            where: { id: String((_c = ctx.message) === null || _c === void 0 ? void 0 : _c.from.id) },
                        });
                        yield (0, sendForm_1.sendForm)(ctx, user);
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
                            yield saveForm(ctx);
                            const user = yield prisma.user.findUnique({
                                where: { id: String((_d = ctx.message) === null || _d === void 0 ? void 0 : _d.from.id) },
                            });
                            yield (0, sendForm_1.sendForm)(ctx, user);
                            yield ctx.reply(ctx.t('profile_menu'), {
                                reply_markup: (0, keyboards_1.profileKeyboard)()
                            });
                        }
                        else {
                            ctx.session.question = "file";
                            const user = yield prisma.user.findUnique({
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
                        const user = yield prisma.user.findUnique({
                            where: { id: String((_e = ctx.message) === null || _e === void 0 ? void 0 : _e.from.id) },
                        });
                        yield (0, sendForm_1.sendForm)(ctx, user);
                        yield ctx.reply(ctx.t('profile_menu'), {
                            reply_markup: (0, keyboards_1.profileKeyboard)()
                        });
                    }
                    else {
                        const user = yield prisma.user.findUnique({
                            where: { id: String(ctx.message.from.id) },
                            select: { files: true },
                        });
                        const files = (user === null || user === void 0 ? void 0 : user.files) ? JSON.parse(user === null || user === void 0 ? void 0 : user.files) : [];
                        if (message === ctx.t("leave_current") && (user === null || user === void 0 ? void 0 : user.files) && files.length > 0) {
                            yield saveForm(ctx);
                            const user = yield prisma.user.findUnique({
                                where: { id: String((_f = ctx.message) === null || _f === void 0 ? void 0 : _f.from.id) },
                            });
                            yield (0, sendForm_1.sendForm)(ctx, user);
                            ctx.session.question = "all_right";
                            yield ctx.reply(ctx.t('all_right_question'), {
                                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                            });
                        }
                        else {
                            const isImage = (_g = ctx.message) === null || _g === void 0 ? void 0 : _g.photo;
                            const isVideo = (_h = ctx.message) === null || _h === void 0 ? void 0 : _h.video;
                            if (isVideo && ((_k = (_j = ctx.message) === null || _j === void 0 ? void 0 : _j.video) === null || _k === void 0 ? void 0 : _k.duration) && ((_m = (_l = ctx.message) === null || _l === void 0 ? void 0 : _l.video) === null || _m === void 0 ? void 0 : _m.duration) < 15) {
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
                        const user = yield prisma.user.findUnique({
                            where: { id: String((_o = ctx.message) === null || _o === void 0 ? void 0 : _o.from.id) },
                        });
                        yield (0, sendForm_1.sendForm)(ctx, user);
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
                            yield saveForm(ctx);
                            const user = yield prisma.user.findUnique({
                                where: { id: String((_p = ctx.message) === null || _p === void 0 ? void 0 : _p.from.id) },
                            });
                            yield (0, sendForm_1.sendForm)(ctx, user);
                            yield ctx.reply(ctx.t('profile_menu'), {
                                reply_markup: (0, keyboards_1.profileKeyboard)()
                            });
                        }
                        else {
                            ctx.session.question = "all_right";
                            ctx.session.form.files = ctx.session.form.temp_files;
                            ctx.session.form.temp_files = [];
                            ctx.session.additionalFormInfo.canGoBack = false;
                            yield saveForm(ctx);
                            const user = yield prisma.user.findUnique({
                                where: { id: String((_q = ctx.message) === null || _q === void 0 ? void 0 : _q.from.id) },
                            });
                            yield (0, sendForm_1.sendForm)(ctx, user);
                            yield ctx.reply(ctx.t('all_right_question'), {
                                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                            });
                        }
                    }
                    else {
                        const isImage = (_r = ctx.message) === null || _r === void 0 ? void 0 : _r.photo;
                        const isVideo = (_s = ctx.message) === null || _s === void 0 ? void 0 : _s.video;
                        if (isVideo && ((_u = (_t = ctx.message) === null || _t === void 0 ? void 0 : _t.video) === null || _u === void 0 ? void 0 : _u.duration) && ((_w = (_v = ctx.message) === null || _v === void 0 ? void 0 : _v.video) === null || _w === void 0 ? void 0 : _w.duration) < 15) {
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
                                    yield saveForm(ctx);
                                    const user = yield prisma.user.findUnique({
                                        where: { id: String((_x = ctx.message) === null || _x === void 0 ? void 0 : _x.from.id) },
                                    });
                                    yield (0, sendForm_1.sendForm)(ctx, user);
                                    yield ctx.reply(ctx.t('profile_menu'), {
                                        reply_markup: (0, keyboards_1.profileKeyboard)()
                                    });
                                }
                                else {
                                    ctx.session.question = "all_right";
                                    ctx.session.form.files = ctx.session.form.temp_files;
                                    ctx.session.form.temp_files = [];
                                    yield saveForm(ctx);
                                    const user = yield prisma.user.findUnique({
                                        where: { id: String((_y = ctx.message) === null || _y === void 0 ? void 0 : _y.from.id) },
                                    });
                                    yield (0, sendForm_1.sendForm)(ctx, user);
                                    yield ctx.reply(ctx.t('all_right_question'), {
                                        reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                                    });
                                }
                            }
                        }
                        else {
                            const user = yield prisma.user.findUnique({
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
                            reply_markup: {
                                remove_keyboard: true
                            }
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
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                    const candidate = yield getCandidate(ctx);
                    console.log(candidate);
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { notSendThisIs: true });
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
            else {
                yield ctx.reply(ctx.t('no_such_answer'));
            }
        }));
        bot.start();
    });
}
startBot();
