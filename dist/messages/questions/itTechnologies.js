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
Object.defineProperty(exports, "__esModule", { value: true });
exports.itTechnologiesQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const saveUser_1 = require("../../functions/db/saveUser");
const hasLinks_1 = require("../../functions/hasLinks");
const sendForm_1 = require("../../functions/sendForm");
const itTechnologiesQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'it_technologies',
        input: message,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType,
        editingMode: !!ctx.session.additionalFormInfo.canGoBack
    }, 'User answering IT technologies question');
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User returning to profile from IT technologies edit');
        ctx.session.step = 'profile';
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else if (!message || message === ctx.t('skip')) {
        ctx.logger.info({ userId }, 'User skipped IT technologies');
        ctx.session.activeProfile.technologies = "";
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after skipping technologies in edit mode');
            ctx.session.step = 'profile';
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveUser_1.saveUser)(ctx);
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            ctx.logger.info({ userId }, 'Proceeding to GitHub question after skipping technologies');
            ctx.session.question = "it_github";
            yield ctx.reply(ctx.t('it_github_question'), {
                reply_markup: (0, keyboards_1.itGithubKeyboard)(ctx.t, ctx.session),
                parse_mode: "Markdown",
                link_preview_options: {
                    is_disabled: true
                }
            });
        }
    }
    else if ((0, hasLinks_1.hasLinks)(message)) {
        ctx.logger.warn({ userId }, 'User IT technologies contains links');
        yield ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: (0, keyboards_1.itTechnologiesKeyboard)(ctx.t, ctx.session)
        });
    }
    else {
        const technologies = message.split(" ").filter(tech => tech.length > 0);
        // Проверяем количество технологий
        if (technologies.length > 20) {
            ctx.logger.warn({ userId, technologiesCount: technologies.length }, 'Too many technologies');
            yield ctx.reply(ctx.t('it_technologies_long_all'), {
                reply_markup: (0, keyboards_1.itTechnologiesKeyboard)(ctx.t, ctx.session)
            });
            return;
        }
        // Проверяем длину каждой технологии
        const longTechs = technologies.filter(tech => tech.length > 20);
        if (longTechs.length > 0) {
            ctx.logger.warn({
                userId,
                longTechnologies: longTechs
            }, 'Some technologies are too long');
            yield ctx.reply(ctx.t('it_technologies_long_one'), {
                reply_markup: (0, keyboards_1.itTechnologiesKeyboard)(ctx.t, ctx.session)
            });
            return;
        }
        // Проверяем на дубликаты
        if (new Set(technologies).size !== technologies.length) {
            ctx.logger.warn({ userId, technologies }, 'Technologies contain duplicates');
            yield ctx.reply(ctx.t('it_technologies_duplicates'), {
                reply_markup: (0, keyboards_1.itTechnologiesKeyboard)(ctx.t, ctx.session)
            });
            return;
        }
        ctx.logger.info({
            userId,
            technologiesCount: technologies.length,
            technologies: technologies.join(" ")
        }, 'User IT technologies validated and saved');
        ctx.session.activeProfile.technologies = technologies.join(" ");
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after saving technologies in edit mode');
            ctx.session.step = 'profile';
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveUser_1.saveUser)(ctx);
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            ctx.logger.info({ userId }, 'Proceeding to GitHub question after saving technologies');
            ctx.session.question = "it_github";
            yield ctx.reply(ctx.t('it_github_question'), {
                reply_markup: (0, keyboards_1.itGithubKeyboard)(ctx.t, ctx.session),
                parse_mode: "Markdown",
                link_preview_options: {
                    is_disabled: true
                }
            });
        }
    }
});
exports.itTechnologiesQuestion = itTechnologiesQuestion;
