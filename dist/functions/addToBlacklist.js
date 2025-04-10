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
exports.addToBlacklist = void 0;
const getCandidate_1 = require("./db/getCandidate");
const postgres_1 = require("../db/postgres");
const sendMutualSympathyAfterAnswer_1 = require("./sendMutualSympathyAfterAnswer");
const sendForm_1 = require("./sendForm");
const candidatesEnded_1 = require("./candidatesEnded");
const startSearchingPeople_1 = require("./startSearchingPeople");
const addToBlacklist = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (ctx.session.currentCandidateProfile) {
        // Проверяем, не добавлен ли уже пользователь в черный список
        const existingBlacklist = yield postgres_1.prisma.blacklist.findFirst({
            where: {
                userId: String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id),
                targetProfileId: ctx.session.currentCandidateProfile.id,
                targetUserId: ctx.session.currentCandidateProfile.userId
            }
        });
        if (existingBlacklist) {
            yield ctx.reply(ctx.t('more_options_blacklist_already'));
            return;
        }
        // Добавляем пользователя в черный список
        yield postgres_1.prisma.blacklist.create({
            data: {
                userId: String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id),
                targetProfileId: ctx.session.currentCandidateProfile.id,
                profileType: ctx.session.currentCandidateProfile.profileType,
                targetUserId: ctx.session.currentCandidateProfile.userId
            }
        });
        yield ctx.reply(ctx.t('more_options_blacklist_success'));
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
            return;
        }
        yield (0, startSearchingPeople_1.startSearchingPeople)(ctx);
        const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
        ctx.logger.info(candidate, 'This is new candidate');
        if (candidate) {
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
        else {
            yield (0, candidatesEnded_1.candidatesEnded)(ctx);
        }
    }
});
exports.addToBlacklist = addToBlacklist;
