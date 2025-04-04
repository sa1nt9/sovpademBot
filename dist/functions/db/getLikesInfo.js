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
exports.getLikesCount = getLikesCount;
exports.getLikesInfo = getLikesInfo;
const postgres_1 = require("../../db/postgres");
const logger_1 = require("../../logger");
function getLikesCount(targetProfileId, profileType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
            const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    fromProfileId: targetProfileId,
                    fromProfileType: profileType,
                },
                select: {
                    toProfileId: true
                }
            });
            // Формируем массив ID, которым уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map((item) => item.toProfileId);
            // Подсчитываем количество лайков, полученных профилем
            const count = yield postgres_1.prisma.profileLike.count({
                where: {
                    toProfileId: targetProfileId,
                    toProfileType: profileType,
                    liked: true,
                    // Исключаем профили, которым уже был дан ответ
                    fromProfileId: {
                        notIn: respondedIds
                    }
                }
            });
            return count;
        }
        catch (error) {
            console.error("Error in getLikesCount:", error);
            return 0;
        }
    });
}
function getLikesInfo(targetProfileId, profileType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
            const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    fromProfileId: targetProfileId,
                    fromProfileType: profileType,
                },
                select: {
                    toProfileId: true
                }
            });
            // Формируем массив ID, которым уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map((item) => item.toProfileId);
            // Получаем информацию о профилях, которые поставили лайк
            const likers = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    toProfileId: targetProfileId,
                    toProfileType: profileType,
                    liked: true,
                    // Исключаем профили, которым уже был дан ответ
                    fromProfileId: {
                        notIn: respondedIds
                    }
                },
                include: {
                    relationshipFrom: {
                        include: {
                            user: {
                                select: {
                                    gender: true
                                }
                            }
                        }
                    },
                    sportFrom: {
                        include: {
                            user: {
                                select: {
                                    gender: true
                                }
                            }
                        }
                    },
                    gameFrom: {
                        include: {
                            user: {
                                select: {
                                    gender: true
                                }
                            }
                        }
                    },
                    hobbyFrom: {
                        include: {
                            user: {
                                select: {
                                    gender: true
                                }
                            }
                        }
                    },
                    itFrom: {
                        include: {
                            user: {
                                select: {
                                    gender: true
                                }
                            }
                        }
                    },
                }
            });
            const count = likers.length;
            // Получаем пол для каждого профиля, учитывая тип профиля
            const genders = new Set(likers.map(liker => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                let gender = 'male'; // По умолчанию
                // Проверяем тип профиля и получаем соответствующий объект
                switch (liker.fromProfileType) {
                    case 'RELATIONSHIP':
                        gender = ((_b = (_a = liker.relationshipFrom) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.gender) || 'male';
                        break;
                    case 'SPORT':
                        gender = ((_d = (_c = liker.sportFrom) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.gender) || 'male';
                        break;
                    case 'GAME':
                        gender = ((_f = (_e = liker.gameFrom) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.gender) || 'male';
                        break;
                    case 'HOBBY':
                        gender = ((_h = (_g = liker.hobbyFrom) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.gender) || 'male';
                        break;
                    case 'IT':
                        gender = ((_k = (_j = liker.itFrom) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.gender) || 'male';
                        break;
                }
                return gender;
            }));
            let gender;
            if (genders.size === 1) {
                gender = genders.has('female') ? 'female' : 'male';
            }
            else {
                gender = 'all';
            }
            return { count, gender };
        }
        catch (error) {
            logger_1.logger.error(error, "Error in getLikesInfo:");
            return { count: 0, gender: 'all' };
        }
    });
}
