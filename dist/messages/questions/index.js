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
exports.questionsStep = questionsStep;
const years_1 = require("./years");
const gender_1 = require("./gender");
const interestedIn_1 = require("./interestedIn");
const city_1 = require("./city");
const name_1 = require("./name");
const text_1 = require("./text");
const file_1 = require("./file");
const addAnotherFile_1 = require("./addAnotherFile");
const allRight_1 = require("./allRight");
const sportLevel_1 = require("./sportLevel");
const itExperience_1 = require("./itExperience");
const itTechnologies_1 = require("./itTechnologies");
const itGithub_1 = require("./itGithub");
const gameAccount_1 = require("./gameAccount");
// export const questionsWays = {
//     [ProfileType.RELATIONSHIP]: [
//         'years',
//         'gender',
//         'interested_in',
//         'city',
//         'name',
//         ''
//     ],
//     [ProfileType.SPORT]: [
//         'sport_type',
//         'years',
//         'gender',
//         'interested_in',
//         'city',
//         'name'
// }
function questionsStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        ctx.logger.info({ message, question: ctx.session.question });
        switch (ctx.session.question) {
            case "sport_level":
                yield (0, sportLevel_1.sportLevelQuestion)(ctx);
                break;
            case "it_experience":
                yield (0, itExperience_1.itExperienceQuestion)(ctx);
                break;
            case "it_technologies":
                yield (0, itTechnologies_1.itTechnologiesQuestion)(ctx);
                break;
            case "it_github":
                yield (0, itGithub_1.itGithubQuestion)(ctx);
                break;
            case "game_account":
                yield (0, gameAccount_1.gameAccountQuestion)(ctx);
                break;
            case "years":
                yield (0, years_1.yearsQuestion)(ctx);
                break;
            case "gender":
                yield (0, gender_1.genderQuestion)(ctx);
                break;
            case "interested_in":
                yield (0, interestedIn_1.interestedInQuestion)(ctx);
                break;
            case "city":
                yield (0, city_1.cityQuestion)(ctx);
                break;
            case "name":
                yield (0, name_1.nameQuestion)(ctx);
                break;
            case "text":
                yield (0, text_1.textQuestion)(ctx);
                break;
            case "file":
                yield (0, file_1.fileQuestion)(ctx);
                break;
            case "add_another_file":
                yield (0, addAnotherFile_1.addAnotherFileQuestion)(ctx);
                break;
            case "all_right":
                yield (0, allRight_1.allRightQuestion)(ctx);
                break;
        }
    });
}
