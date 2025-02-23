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
const storage_psql_1 = require("@grammyjs/storage-psql");
const pg_1 = require("pg");
dotenv.config();
console.log(process.env.BOT_TOKEN);
const bot = new grammy_1.Bot(String(process.env.BOT_TOKEN));
const i18n = new i18n_1.I18n({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});
function initial() {
    return { step: "choose_language_start", question: 'years' };
}
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client({
            host: process.env.POSTGRES_HOST || 'localhost',
            port: Number(process.env.POSTGRES_PORT) || 5432,
            user: process.env.POSTGRES_USERNAME || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'root',
            database: process.env.POSTGRES_NAME || 'postgres',
        });
        yield client.connect();
        bot.use((0, grammy_1.session)({
            initial,
            storage: yield storage_psql_1.PsqlAdapter.create({ tableName: 'sessions', client }),
        }));
        bot.use(i18n);
        bot.command("start", (ctx) => {
            ctx.session.step = "choose_language_start";
            ctx.reply(ctx.t('choose_language'), {
                reply_markup: keyboards_1.languageKeyboard
            });
        });
        bot.command("language", (ctx) => {
            ctx.session.step = "choose_language";
            ctx.reply(ctx.t('choose_language'), {
                reply_markup: keyboards_1.languageKeyboard
            });
        });
        bot.on("message", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const message = ctx.message.text;
            switch (ctx.session.step) {
                case "choose_language_start":
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
                    break;
                case "prepare_message":
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
                    break;
                case "accept_privacy":
                    if (message === ctx.t('ok')) {
                        ctx.session.step = "questions";
                        ctx.session.question = 'years';
                        yield ctx.reply(ctx.t('years_question'), {
                            reply_markup: {
                                remove_keyboard: true,
                            },
                        });
                    }
                    else {
                        yield ctx.reply(ctx.t('no_such_answer'), {
                            reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                        });
                    }
                    break;
                case "questions":
                    switch (ctx.session.question) {
                        case "years":
                            console.log(yield ctx.i18n.getLocale());
                            const n = Number(message);
                            if (!/^\d+$/.test(message || "str")) {
                                yield ctx.reply(ctx.t('type_years'), {
                                    reply_markup: {
                                        remove_keyboard: true
                                    },
                                });
                            }
                            else if (n <= 8) {
                                yield ctx.reply(ctx.t('type_bigger_year'), {
                                    reply_markup: {
                                        remove_keyboard: true
                                    },
                                });
                            }
                            else if (n > 100) {
                                yield ctx.reply(ctx.t('type_smaller_year'), {
                                    reply_markup: {
                                        remove_keyboard: true
                                    },
                                });
                            }
                            else {
                                ctx.session.question = "gender";
                                yield ctx.reply(ctx.t('gender_question'), {
                                    reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
                                });
                            }
                            break;
                        case "gender":
                            console.log(yield ctx.i18n.getLocale());
                            if ((_a = (0, keyboards_1.genderKeyboard)(ctx.t)) === null || _a === void 0 ? void 0 : _a.keyboard[0].includes(message || "")) {
                                ctx.session.question = "interested_in";
                                yield ctx.reply(ctx.t('interested_in_question'), {
                                    reply_markup: (0, keyboards_1.interestedInKeyboard)(ctx.t)
                                });
                            }
                            else {
                                yield ctx.reply(ctx.t('no_such_answer'), {
                                    reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
                                });
                            }
                            break;
                        case "interested_in":
                            if ((_b = (0, keyboards_1.interestedInKeyboard)(ctx.t)) === null || _b === void 0 ? void 0 : _b.keyboard[0].includes(message || "")) {
                                ctx.session.question = "city";
                                yield ctx.reply(ctx.t('city_question'), {
                                    reply_markup: (0, keyboards_1.cityKeyboard)(ctx.t)
                                });
                            }
                            else {
                                yield ctx.reply(ctx.t('no_such_answer'), {
                                    reply_markup: (0, keyboards_1.interestedInKeyboard)(ctx.t)
                                });
                            }
                            break;
                        case "city":
                            console.log('location', ctx.message.location);
                            if (ctx.message.location) {
                                ctx.session.question = "name";
                                yield ctx.reply(ctx.t('name_question'), {
                                    reply_markup: {
                                        remove_keyboard: true
                                    }
                                });
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
                                        ctx.session.question = "name";
                                        yield ctx.reply(ctx.t('name_question'), {
                                            reply_markup: { remove_keyboard: true }
                                        });
                                    }
                                    else {
                                        yield ctx.reply(ctx.t('no_such_city'), {
                                            reply_markup: (0, keyboards_1.cityKeyboard)(ctx.t)
                                        });
                                    }
                                }
                                catch (error) {
                                    console.error('Ошибка чтения файла cities.json:', error);
                                    yield ctx.reply("error");
                                }
                            }
                            break;
                        case "name":
                            if (!message) {
                                yield ctx.reply(ctx.t('type_name'), {
                                    reply_markup: { remove_keyboard: true }
                                });
                            }
                            else if (message.length > 100) {
                                yield ctx.reply(ctx.t('long_name'), {
                                    reply_markup: { remove_keyboard: true }
                                });
                            }
                            else {
                                ctx.session.question = "text";
                                yield ctx.reply(ctx.t('text_question'), {
                                    reply_markup: (0, keyboards_1.skipKeyboard)(ctx.t)
                                });
                            }
                            break;
                        case "name":
                            if (!message) {
                                yield ctx.reply(ctx.t('type_name'), {
                                    reply_markup: { remove_keyboard: true }
                                });
                            }
                            else if (message.length > 100) {
                                yield ctx.reply(ctx.t('long_name'), {
                                    reply_markup: { remove_keyboard: true }
                                });
                            }
                            else {
                                ctx.session.question = "text";
                                yield ctx.reply(ctx.t('text_question'), {
                                    reply_markup: (0, keyboards_1.skipKeyboard)(ctx.t)
                                });
                            }
                            break;
                        case "text":
                            if (message && message.length > 1000) {
                                yield ctx.reply(ctx.t('long_text'), {
                                    reply_markup: (0, keyboards_1.skipKeyboard)(ctx.t)
                                });
                            }
                            else if (!message || message === ctx.t('skip')) {
                                yield ctx.reply(ctx.t('file_question'), {
                                    reply_markup: (0, keyboards_1.skipKeyboard)(ctx.t)
                                });
                            }
                            else {
                                ctx.session.question = "file";
                                yield ctx.reply(ctx.t('file_question'), {
                                    reply_markup: (0, keyboards_1.skipKeyboard)(ctx.t)
                                });
                            }
                            break;
                    }
                    break;
                default:
                    yield ctx.reply(ctx.t('no_such_answer'));
            }
        }));
        bot.start();
    });
}
startBot();
