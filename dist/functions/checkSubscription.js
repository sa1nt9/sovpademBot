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
exports.checkSubscription = checkSubscription;
function checkSubscription(ctx, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const member = yield ctx.api.getChatMember(`@${channelId}`, (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
            if (["member", "administrator", "creator"].includes(member.status)) {
                return true; // Подписан
            }
            else {
                return false; // Не подписан
            }
        }
        catch (error) {
            console.error("Ошибка проверки подписки:", error);
            return false; // Ошибка — считаем, что не подписан
        }
    });
}
