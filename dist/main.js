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
dotenv.config();
console.log(process.env.BOT_TOKEN);
const txttojson = () => {
    const data = fs_1.default.readFileSync("./data/cities1000.txt", 'utf-8');
    // Разбиваем на строки
    const lines = data.split('\n');
    // Парсим строки в объекты
    const cities = lines.map(line => {
        var _a;
        const parts = line.split('\t');
        return {
            id: parts[0], // GeoNames ID
            name: parts[1], // Официальное название
            alternateNames: (_a = parts[3]) === null || _a === void 0 ? void 0 : _a.split(','), // Альтернативные названия (массив)
            latitude: parseFloat(parts[4]), // Широта
            longitude: parseFloat(parts[5]), // Долгота
            country: parts[8] // Код страны
        };
    }).filter(city => city.name); // Убираем пустые строки
    // Сохраняем в JSON
    fs_1.default.writeFileSync('./data/cities.json', JSON.stringify(cities, null, 2), 'utf-8');
    console.log(`✅ Успешно сохранено ${cities.length} городов в cities.json`);
};
const bot = new grammy_1.Bot(String(process.env.BOT_TOKEN));
const i18n = new i18n_1.I18n({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});
function initial() {
    return { step: "choose_language_start", question: 'years' };
}
bot.use((0, grammy_1.session)({ initial }));
bot.use(i18n);
bot.command("start", (ctx) => {
    txttojson();
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
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const message = ctx.message.text;
    switch (ctx.session.step) {
        case "choose_language_start":
            const language = languages_1.languages.find(i => i.name === message);
            if (language) {
                yield ctx.i18n.setLocale(language.mark || "ru");
                ctx.session.step = "prepare_message";
                yield ctx.reply(ctx.t('lets_start'), {
                    reply_markup: {
                        keyboard: [[ctx.t("ok_lets_start")]],
                        resize_keyboard: true,
                    },
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
            yield ctx.reply(ctx.t('no_such_answer'));
    }
}));
bot.start();
