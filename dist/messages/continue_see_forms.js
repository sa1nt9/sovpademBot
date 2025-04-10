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
exports.continueSeeFormsStep = continueSeeFormsStep;
const candidatesEnded_1 = require("../functions/candidatesEnded");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
const startSearchingPeople_1 = require("../functions/startSearchingPeople");
function continueSeeFormsStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, startSearchingPeople_1.startSearchingPeople)(ctx, { setActive: true });
        const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
        ctx.logger.info(candidate, 'This is new candidate');
        if (candidate) {
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
        else {
            yield (0, candidatesEnded_1.candidatesEnded)(ctx);
        }
    });
}
