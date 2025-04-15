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
exports.addToBlacklistCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const addToBlacklist_1 = require("../functions/addToBlacklist");
const addToBlacklistCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({ userId }, 'Starting add to blacklist command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser && ctx.session.currentCandidateProfile && (ctx.session.step === "search_people" || ctx.session.step === "search_people_with_likes" || ctx.session.step === "options_to_user")) {
        ctx.logger.info({
            userId,
            candidateProfileId: ctx.session.currentCandidateProfile.id,
            step: ctx.session.step
        }, 'Adding profile to blacklist');
        yield (0, addToBlacklist_1.addToBlacklist)(ctx);
    }
    else {
        ctx.session.step = "cannot_send_complain";
        ctx.logger.warn({
            userId,
            step: ctx.session.step,
            hasCandidateProfile: !!ctx.session.currentCandidateProfile
        }, 'Cannot add to blacklist - wrong context');
        yield ctx.reply(ctx.t('can_add_to_blacklist_only_while_searching'), {
            reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t, true)
        });
    }
});
exports.addToBlacklistCommand = addToBlacklistCommand;
