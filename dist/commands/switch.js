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
exports.switchCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const profilesService_1 = require("../functions/db/profilesService");
const switchCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({ userId }, 'Starting switch command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.logger.info({ userId }, 'Getting user profiles for switching');
        ctx.session.step = "switch_profile";
        const profiles = yield (0, profilesService_1.getUserProfiles)(userId, ctx);
        yield ctx.reply(ctx.t('switch_profile_message'), {
            reply_markup: (0, keyboards_1.switchProfileKeyboard)(ctx.t, profiles)
        });
    }
    else {
        ctx.logger.info({ userId }, 'No existing user, showing profile type selection');
        ctx.session.step = "create_profile_type";
        ctx.session.isCreatingProfile = true;
        yield ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
        });
    }
});
exports.switchCommand = switchCommand;
