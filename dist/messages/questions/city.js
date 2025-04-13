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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const fs_1 = __importDefault(require("fs"));
const haversine_1 = require("../../functions/haversine");
const cityQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'city',
        input: message,
        hasLocation: !!ctx.message.location,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType
    }, 'User answering city question');
    if (message === `${ctx.session.activeProfile.ownCoordinates ? "📍 " : ""}${ctx.session.activeProfile.city}`) {
        ctx.logger.info({ userId, city: ctx.session.activeProfile.city }, 'User confirmed current city');
        ctx.session.question = "name";
        yield ctx.reply(ctx.t('name_question'), {
            reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
        });
    }
    else if (ctx.message.location) {
        const { latitude, longitude } = ctx.message.location;
        ctx.logger.info({ userId, latitude, longitude }, 'User shared location');
        try {
            const cities = JSON.parse(fs_1.default.readFileSync("./data/cities.json", "utf-8"));
            let nearestCity = null;
            let minDistance = Infinity;
            for (const city of cities) {
                const distance = (0, haversine_1.haversine)(latitude, longitude, city.latitude, city.longitude);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCity = city;
                }
            }
            if (nearestCity) {
                ctx.logger.info({
                    userId,
                    nearestCity: nearestCity.name,
                    distance: `${minDistance.toFixed(2)} km`,
                }, 'Found nearest city to user location');
                ctx.session.activeProfile.city = nearestCity.name;
                ctx.session.activeProfile.ownCoordinates = true;
                ctx.session.activeProfile.location = { longitude: nearestCity.longitude, latitude: nearestCity.latitude };
            }
            ctx.session.question = "name";
            yield ctx.reply(ctx.t("name_question"), {
                reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session),
            });
        }
        catch (error) {
            ctx.logger.error({ userId, error }, "Error reading cities.json file");
            yield ctx.reply("Ошибка обработки данных.");
        }
    }
    else {
        try {
            const cities = JSON.parse(fs_1.default.readFileSync("./data/cities.json", "utf-8"));
            const normalizedMessage = message === null || message === void 0 ? void 0 : message.trim().toLowerCase();
            ctx.logger.info({ userId, cityInput: message }, 'User entered city name manually');
            const foundCity = cities.find(city => {
                const cityNames = [city.name, ...(city.alternateNames || [])];
                return cityNames.some(cityName => cityName.toLowerCase() === normalizedMessage);
            });
            if (foundCity) {
                ctx.logger.info({ userId, city: message, found: true }, 'City found in database');
                ctx.session.activeProfile.city = message || "";
                ctx.session.activeProfile.ownCoordinates = false;
                ctx.session.activeProfile.location = { longitude: foundCity.longitude, latitude: foundCity.latitude };
                ctx.session.question = "name";
                yield ctx.reply(ctx.t('name_question'), {
                    reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
                });
            }
            else {
                ctx.logger.warn({ userId, cityInput: message }, 'City not found in database');
                yield ctx.reply(ctx.t('no_such_city'), {
                    reply_markup: (0, keyboards_1.cityKeyboard)(ctx.t, ctx.session)
                });
            }
        }
        catch (error) {
            ctx.logger.error({ userId, error }, 'Error reading cities.json file');
            yield ctx.reply("error");
        }
    }
});
exports.cityQuestion = cityQuestion;
