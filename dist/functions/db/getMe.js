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
exports.getMe = getMe;
const postgres_1 = require("../../db/postgres");
const logger_1 = require("../../logger");
function getMe(id) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info({ userId: id }, 'Getting user profile');
        const user = yield postgres_1.prisma.user.findUnique({
            where: { id: id },
        });
        if (user) {
            logger_1.logger.info({ userId: id }, 'User profile found');
        }
        else {
            logger_1.logger.warn({ userId: id }, 'User profile not found');
        }
        return user;
    });
}
