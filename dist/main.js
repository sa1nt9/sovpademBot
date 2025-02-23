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
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const dotenv = __importStar(require("dotenv"));
const i18n_1 = require("@grammyjs/i18n");
const languages_1 = require("./constants/languages");
dotenv.config();
console.log(process.env.BOT_TOKEN);
const bot = new grammy_1.Bot(String(process.env.BOT_TOKEN));
const i18n = new i18n_1.I18n({
    defaultLocale: "en",
    directory: "locales",
});
bot.use(i18n);
bot.command("start", (ctx) => {
    ctx.reply(ctx.t('choose_language'), {
        reply_markup: {
            keyboard: languages_1.languageButtons,
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
});
bot.command("language", (ctx) => {
    ctx.reply(ctx.t('choose_language'), {
        reply_markup: {
            keyboard: languages_1.languageButtons,
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
});
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message.text;
    if (languages_1.languageButtons.some(button => button[0] === message || button.some(i => i === message))) {
        yield ctx.reply(ctx.t('lets_start'), {
            reply_markup: {
                keyboard: [],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    }
    else {
        yield ctx.reply(ctx.t('no_such_answer'));
    }
}));
bot.start();
