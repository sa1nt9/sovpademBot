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
exports.deactivateCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const profilesService_1 = require("../functions/db/profilesService");
const deactivateCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({ userId }, 'Starting deactivate command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.session.step = 'disable_form';
        ctx.logger.info({ userId }, 'Getting user profiles for deactivation');
        const profiles = yield (0, profilesService_1.getUserProfiles)(userId, ctx);
        yield ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
            reply_markup: (0, keyboards_1.deactivateProfileKeyboard)(ctx.t, profiles)
        });
    }
    else {
        ctx.session.step = "you_dont_have_form";
        ctx.logger.warn({ userId }, 'User tried to deactivate without profile');
        yield ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
        });
    }
});
exports.deactivateCommand = deactivateCommand;
