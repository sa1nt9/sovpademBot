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
exports.bot = void 0;
const logger_1 = require("./logger");
const grammy_1 = require("grammy");
const dotenv = __importStar(require("dotenv"));
const sessionInitial_1 = require("./functions/sessionInitial");
const error_1 = require("./handlers/error");
const i18n_1 = require("./i18n");
const postgres_1 = require("./db/postgres");
const checkSubscriptionMiddleware_1 = require("./middlewares/checkSubscriptionMiddleware");
const storage_prisma_1 = require("@grammyjs/storage-prisma");
const myprofile_1 = require("./commands/myprofile");
const language_1 = require("./commands/language");
const deactivate_1 = require("./commands/deactivate");
const start_1 = require("./commands/start");
const complain_1 = require("./commands/complain");
const roulette_1 = require("./commands/roulette");
const message_1 = require("./events/message");
const callback_query_1 = require("./events/callback_query");
const rouletteMiddleware_1 = require("./middlewares/rouletteMiddleware");
const stop_roulette_1 = require("./commands/stop_roulette");
const stats_1 = require("./commands/stats");
const blacklist_1 = require("./commands/blacklist");
const add_to_blacklist_1 = require("./commands/add_to_blacklist");
const matches_1 = require("./commands/matches");
const inline_query_1 = require("./events/inline_query");
const switch_1 = require("./commands/switch");
const changeSessionFieldsMiddleware_1 = require("./middlewares/changeSessionFieldsMiddleware");
dotenv.config();
exports.bot = new grammy_1.Bot(String(process.env.BOT_TOKEN));
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, postgres_1.connectPostgres)();
        exports.bot.catch(error_1.errorHandler);
        exports.bot.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.logger = logger_1.logger;
            yield next();
        }));
        const sessionMiddleware = (0, grammy_1.session)({
            initial: sessionInitial_1.sessionInitial,
            storage: new storage_prisma_1.PrismaAdapter(postgres_1.prisma.session),
        });
        exports.bot.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.inlineQuery) {
                return next();
            }
            return sessionMiddleware(ctx, next);
        }));
        exports.bot.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.inlineQuery) {
                return (0, i18n_1.i18n)(true).middleware()(ctx, next);
            }
            return (0, i18n_1.i18n)(false).middleware()(ctx, next);
        }));
        exports.bot.use(checkSubscriptionMiddleware_1.checkSubscriptionMiddleware);
        exports.bot.use(rouletteMiddleware_1.rouletteMiddleware);
        exports.bot.use(changeSessionFieldsMiddleware_1.changeSessionFieldsMiddleware);
        exports.bot.command("start", start_1.startCommand);
        exports.bot.command("myprofile", myprofile_1.myprofileCommand);
        exports.bot.command("switch", switch_1.switchCommand);
        exports.bot.command("roulette", roulette_1.rouletteCommand);
        exports.bot.command("blacklist", blacklist_1.blacklistCommand);
        exports.bot.command("matches", matches_1.matchesCommand);
        exports.bot.command("add_to_blacklist", add_to_blacklist_1.addToBlacklistCommand);
        exports.bot.command("complain", complain_1.complainCommand);
        exports.bot.command("stats", stats_1.statsCommand);
        exports.bot.command("stop_roulette", stop_roulette_1.stopRouletteCommand);
        exports.bot.command("language", language_1.languageCommand);
        exports.bot.command("deactivate", deactivate_1.deactivateCommand);
        exports.bot.on("message", message_1.messageEvent);
        exports.bot.on("callback_query", callback_query_1.callbackQueryEvent);
        exports.bot.on("inline_query", inline_query_1.inlineQueryEvent);
        exports.bot.start();
    });
}
startBot().then(() => {
    console.log('Bot started');
});
