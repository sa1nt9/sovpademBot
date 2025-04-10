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
exports.startSearchingPeople = startSearchingPeople;
const keyboards_1 = require("../constants/keyboards");
const profilesService_1 = require("./db/profilesService");
function startSearchingPeople(ctx_1) {
    return __awaiter(this, arguments, void 0, function* (ctx, options = {}) {
        var _a;
        ctx.session.step = 'search_people';
        yield ctx.reply("✨🔍", {
            reply_markup: (0, keyboards_1.answerFormKeyboard)()
        });
        if (options.setActive) {
            yield (0, profilesService_1.toggleProfileActive)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), ctx.session.activeProfile.profileType, true, ctx.session.activeProfile.profileType !== "RELATIONSHIP" ? ctx.session.activeProfile.subType : undefined);
        }
    });
}
