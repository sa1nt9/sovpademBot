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
const choose_language_1 = require("./messages/choose_language");
const choose_language_start_1 = require("./messages/choose_language_start");
const accept_privacy_1 = require("./messages/accept_privacy");
const prepare_message_1 = require("./messages/prepare_message");
const questions_1 = require("./messages/questions");
const profile_1 = require("./messages/profile");
const sleep_menu_1 = require("./messages/sleep_menu");
const friends_1 = require("./messages/friends");
const disable_form_1 = require("./messages/disable_form");
const form_disabled_1 = require("./messages/form_disabled");
const you_dont_have_form_1 = require("./messages/you_dont_have_form");
const cannot_send_complain_1 = require("./messages/cannot_send_complain");
const search_people_1 = require("./messages/search_people");
const search_people_with_likes_1 = require("./messages/search_people_with_likes");
const continue_see_forms_1 = require("./messages/continue_see_forms");
const continue_see_likes_forms_1 = require("./messages/continue_see_likes_forms");
const text_or_video_to_user_1 = require("./messages/text_or_video_to_user");
const somebodys_liked_you_1 = require("./messages/somebodys_liked_you");
const complain_2 = require("./messages/complain");
const complain_text_1 = require("./messages/complain_text");
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
        exports.bot.use((0, grammy_1.session)({
            initial: sessionInitial_1.sessionInitial,
            storage: new storage_prisma_1.PrismaAdapter(postgres_1.prisma.session),
        }));
        exports.bot.use(i18n_1.i18n);
        exports.bot.use(checkSubscriptionMiddleware_1.checkSubscriptionMiddleware);
        exports.bot.command("start", start_1.startCommand);
        exports.bot.command("deactivate", deactivate_1.deactivateCommand);
        exports.bot.command("complain", complain_1.complainCommand);
        exports.bot.command("myprofile", myprofile_1.myprofileCommand);
        exports.bot.command("language", language_1.languageCommand);
        exports.bot.on("message", (ctx) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.session.step === "choose_language_start") {
                (0, choose_language_start_1.chooseLanguageStartStep)(ctx);
            }
            else if (ctx.session.step === "choose_language") {
                (0, choose_language_1.chooseLanguageStep)(ctx);
            }
            else if (ctx.session.step === "prepare_message") {
                (0, prepare_message_1.prepareMessageStep)(ctx);
            }
            else if (ctx.session.step === "accept_privacy") {
                (0, accept_privacy_1.acceptPrivacyStep)(ctx);
            }
            else if (ctx.session.step === "questions") {
                (0, questions_1.questionsStep)(ctx);
            }
            else if (ctx.session.step === 'profile') {
                (0, profile_1.profileStep)(ctx);
            }
            else if (ctx.session.step === 'sleep_menu') {
                (0, sleep_menu_1.sleepMenuStep)(ctx);
            }
            else if (ctx.session.step === 'friends') {
                (0, friends_1.friendsStep)(ctx);
            }
            else if (ctx.session.step === 'disable_form') {
                (0, disable_form_1.disableFormStep)(ctx);
            }
            else if (ctx.session.step === 'form_disabled') {
                (0, form_disabled_1.formDisabledStep)(ctx);
            }
            else if (ctx.session.step === 'you_dont_have_form') {
                (0, you_dont_have_form_1.youDontHaveFormStep)(ctx);
            }
            else if (ctx.session.step === 'cannot_send_complain') {
                (0, cannot_send_complain_1.cannotSendComplainStep)(ctx);
            }
            else if (ctx.session.step === 'search_people') {
                (0, search_people_1.searchPeopleStep)(ctx);
            }
            else if (ctx.session.step === 'search_people_with_likes') {
                (0, search_people_with_likes_1.searchPeopleWithLikesStep)(ctx);
            }
            else if (ctx.session.step === 'continue_see_forms') {
                (0, continue_see_forms_1.continueSeeFormsStep)(ctx);
            }
            else if (ctx.session.step === 'continue_see_likes_forms') {
                (0, continue_see_likes_forms_1.continueSeeLikesFormsStep)(ctx);
            }
            else if (ctx.session.step === 'text_or_video_to_user') {
                (0, text_or_video_to_user_1.textOrVideoToUserStep)(ctx);
            }
            else if (ctx.session.step === 'somebodys_liked_you') {
                (0, somebodys_liked_you_1.somebodysLikedYouStep)(ctx);
            }
            else if (ctx.session.step === 'complain') {
                (0, complain_2.complainStep)(ctx);
            }
            else if (ctx.session.step === 'complain_text') {
                (0, complain_text_1.complainTextStep)(ctx);
            }
            else {
                yield ctx.reply(ctx.t('no_such_answer'));
            }
        }));
        exports.bot.start();
    });
}
startBot();
