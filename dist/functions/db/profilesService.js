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
exports.getUserProfiles = getUserProfiles;
exports.getUserProfile = getUserProfile;
exports.saveProfile = saveProfile;
exports.toggleProfileActive = toggleProfileActive;
exports.getProfileModelName = getProfileModelName;
const postgres_1 = require("../../db/postgres");
const client_1 = require("@prisma/client");
const logger_1 = require("../../logger");
// Получить все профили пользователя
function getUserProfiles(userId, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const relationship = yield postgres_1.prisma.relationshipProfile.findUnique({
            where: { userId }
        });
        const sports = yield postgres_1.prisma.sportProfile.findMany({
            where: { userId }
        });
        const games = yield postgres_1.prisma.gameProfile.findMany({
            where: { userId }
        });
        const hobbies = yield postgres_1.prisma.hobbyProfile.findMany({
            where: { userId }
        });
        const it = yield postgres_1.prisma.iTProfile.findMany({
            where: { userId }
        });
        const travel = yield postgres_1.prisma.travelProfile.findUnique({
            where: { userId }
        });
        const profiles = [];
        if (relationship) {
            profiles.push({
                profileType: client_1.ProfileType.RELATIONSHIP,
                name: ctx ? ctx.t('profile_type_relationship') : "Relationship",
                isActive: relationship.isActive
            });
        }
        sports.forEach(sport => {
            profiles.push({
                profileType: client_1.ProfileType.SPORT,
                subType: sport.sportType,
                name: ctx ? `${ctx.t('profile_type_sport')}: ${ctx.t(getSportTypeName(sport.sportType))}` : `Sport: ${getSportTypeName(sport.sportType)}`,
                isActive: sport.isActive
            });
        });
        games.forEach(game => {
            profiles.push({
                profileType: client_1.ProfileType.GAME,
                subType: game.gameType,
                name: ctx ? `${ctx.t('profile_type_game')}: ${ctx.t(getGameTypeName(game.gameType))}` : `Game: ${getGameTypeName(game.gameType)}`,
                isActive: game.isActive
            });
        });
        hobbies.forEach(hobby => {
            profiles.push({
                profileType: client_1.ProfileType.HOBBY,
                subType: hobby.hobbyType,
                name: ctx ? `${ctx.t('profile_type_hobby')}: ${ctx.t(getHobbyTypeName(hobby.hobbyType))}` : `Hobby: ${getHobbyTypeName(hobby.hobbyType)}`,
                isActive: hobby.isActive
            });
        });
        it.forEach(itProfile => {
            profiles.push({
                profileType: client_1.ProfileType.IT,
                subType: itProfile.itType,
                name: ctx ? `${ctx.t('profile_type_it')}: ${ctx.t(getITTypeName(itProfile.itType))}` : `IT: ${getITTypeName(itProfile.itType)}`,
                isActive: itProfile.isActive
            });
        });
        if (travel) {
            profiles.push({
                profileType: client_1.ProfileType.TRAVEL,
                name: ctx ? ctx.t('profile_type_travel') : "Travel",
                isActive: travel.isActive
            });
        }
        return profiles;
    });
}
// Получить конкретный профиль пользователя
function getUserProfile(userId, profileType, subType) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (profileType) {
            case client_1.ProfileType.RELATIONSHIP: {
                const profile = yield postgres_1.prisma.relationshipProfile.findUnique({
                    where: { userId }
                });
                if (!profile)
                    return null;
                return Object.assign(Object.assign({}, profile), { profileType: 'RELATIONSHIP', files: JSON.parse(profile.files) });
            }
            case client_1.ProfileType.SPORT: {
                if (!subType)
                    return null;
                const profile = yield postgres_1.prisma.sportProfile.findUnique({
                    where: {
                        userId_sportType: {
                            userId,
                            sportType: subType
                        }
                    }
                });
                if (!profile)
                    return null;
                return Object.assign(Object.assign({}, profile), { profileType: 'SPORT', files: JSON.parse(profile.files) });
            }
            case client_1.ProfileType.GAME: {
                if (!subType)
                    return null;
                const profile = yield postgres_1.prisma.gameProfile.findUnique({
                    where: {
                        userId_gameType: {
                            userId,
                            gameType: subType
                        }
                    }
                });
                if (!profile)
                    return null;
                return Object.assign(Object.assign({}, profile), { profileType: 'GAME', files: JSON.parse(profile.files) });
            }
            case client_1.ProfileType.HOBBY: {
                if (!subType)
                    return null;
                const profile = yield postgres_1.prisma.hobbyProfile.findUnique({
                    where: {
                        userId_hobbyType: {
                            userId,
                            hobbyType: subType
                        }
                    }
                });
                if (!profile)
                    return null;
                return Object.assign(Object.assign({}, profile), { profileType: 'HOBBY', files: JSON.parse(profile.files) });
            }
            case client_1.ProfileType.IT: {
                if (!subType)
                    return null;
                const profile = yield postgres_1.prisma.iTProfile.findUnique({
                    where: {
                        userId_itType: {
                            userId,
                            itType: subType
                        }
                    }
                });
                if (!profile)
                    return null;
                return Object.assign(Object.assign({}, profile), { profileType: 'IT', files: JSON.parse(profile.files) });
            }
            case client_1.ProfileType.TRAVEL: {
                const profile = yield postgres_1.prisma.travelProfile.findUnique({
                    where: { userId }
                });
                if (!profile)
                    return null;
                return Object.assign(Object.assign({}, profile), { profileType: 'TRAVEL', files: JSON.parse(profile.files) });
            }
            default:
                return null;
        }
    });
}
// Сохранить профиль пользователя
function saveProfile(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileJson = JSON.stringify(profile.files);
        switch (profile.profileType) {
            case 'RELATIONSHIP': {
                const relationshipProfile = profile;
                const saved = yield postgres_1.prisma.relationshipProfile.upsert({
                    where: { userId: profile.userId },
                    update: {
                        interestedIn: relationshipProfile.interestedIn,
                        description: relationshipProfile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    },
                    create: {
                        userId: profile.userId,
                        interestedIn: relationshipProfile.interestedIn,
                        description: relationshipProfile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    }
                });
                return Object.assign(Object.assign({}, saved), { profileType: 'RELATIONSHIP', files: profile.files });
            }
            case 'SPORT': {
                const sportProfile = profile;
                const saved = yield postgres_1.prisma.sportProfile.upsert({
                    where: {
                        userId_sportType: {
                            userId: profile.userId,
                            sportType: sportProfile.sportType
                        }
                    },
                    update: {
                        level: sportProfile.level,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    },
                    create: {
                        userId: profile.userId,
                        sportType: sportProfile.sportType,
                        level: sportProfile.level,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    }
                });
                return Object.assign(Object.assign({}, saved), { profileType: 'SPORT', files: profile.files });
            }
            case 'GAME': {
                const gameProfile = profile;
                const saved = yield postgres_1.prisma.gameProfile.upsert({
                    where: {
                        userId_gameType: {
                            userId: profile.userId,
                            gameType: gameProfile.gameType
                        }
                    },
                    update: {
                        rank: gameProfile.rank,
                        accountLink: gameProfile.accountLink,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    },
                    create: {
                        userId: profile.userId,
                        gameType: gameProfile.gameType,
                        rank: gameProfile.rank,
                        accountLink: gameProfile.accountLink,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    }
                });
                return Object.assign(Object.assign({}, saved), { profileType: 'GAME', files: profile.files });
            }
            case 'HOBBY': {
                const hobbyProfile = profile;
                const saved = yield postgres_1.prisma.hobbyProfile.upsert({
                    where: {
                        userId_hobbyType: {
                            userId: profile.userId,
                            hobbyType: hobbyProfile.hobbyType
                        }
                    },
                    update: {
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    },
                    create: {
                        userId: profile.userId,
                        hobbyType: hobbyProfile.hobbyType,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    }
                });
                return Object.assign(Object.assign({}, saved), { profileType: 'HOBBY', files: profile.files });
            }
            case 'IT': {
                const itProfile = profile;
                const saved = yield postgres_1.prisma.iTProfile.upsert({
                    where: {
                        userId_itType: {
                            userId: profile.userId,
                            itType: itProfile.itType
                        }
                    },
                    update: {
                        experience: itProfile.experience,
                        technologies: itProfile.technologies,
                        portfolioLink: itProfile.portfolioLink,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    },
                    create: {
                        userId: profile.userId,
                        itType: itProfile.itType,
                        experience: itProfile.experience,
                        technologies: itProfile.technologies,
                        portfolioLink: itProfile.portfolioLink,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    }
                });
                return Object.assign(Object.assign({}, saved), { profileType: 'IT', files: profile.files });
            }
            case 'TRAVEL': {
                const travelProfile = profile;
                const saved = yield postgres_1.prisma.travelProfile.upsert({
                    where: { userId: profile.userId },
                    update: {
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    },
                    create: {
                        userId: profile.userId,
                        description: profile.description,
                        files: fileJson,
                        isActive: profile.isActive
                    }
                });
                return Object.assign(Object.assign({}, saved), { profileType: 'TRAVEL', files: profile.files });
            }
            default:
                throw new Error(`Неизвестный тип профиля: ${profile.profileType}`);
        }
    });
}
// Включить/выключить профиль
function toggleProfileActive(userId, profileType, isActive, subType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            switch (profileType) {
                case client_1.ProfileType.RELATIONSHIP:
                    yield postgres_1.prisma.relationshipProfile.update({
                        where: { userId },
                        data: { isActive }
                    });
                    break;
                case client_1.ProfileType.SPORT:
                    if (!subType)
                        return false;
                    yield postgres_1.prisma.sportProfile.update({
                        where: {
                            userId_sportType: {
                                userId,
                                sportType: subType
                            }
                        },
                        data: { isActive }
                    });
                    break;
                case client_1.ProfileType.GAME:
                    if (!subType)
                        return false;
                    yield postgres_1.prisma.gameProfile.update({
                        where: {
                            userId_gameType: {
                                userId,
                                gameType: subType
                            }
                        },
                        data: { isActive }
                    });
                    break;
                case client_1.ProfileType.HOBBY:
                    if (!subType)
                        return false;
                    yield postgres_1.prisma.hobbyProfile.update({
                        where: {
                            userId_hobbyType: {
                                userId,
                                hobbyType: subType
                            }
                        },
                        data: { isActive }
                    });
                    break;
                case client_1.ProfileType.IT:
                    if (!subType)
                        return false;
                    yield postgres_1.prisma.iTProfile.update({
                        where: {
                            userId_itType: {
                                userId,
                                itType: subType
                            }
                        },
                        data: { isActive }
                    });
                    break;
                case client_1.ProfileType.TRAVEL:
                    yield postgres_1.prisma.travelProfile.update({
                        where: { userId },
                        data: { isActive }
                    });
                    break;
                default:
                    return false;
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error updating profile status',
                userId,
                profileType,
                subType
            });
            return false;
        }
    });
}
// Получить имя типа спорта
function getSportTypeName(type) {
    const names = {
        [client_1.SportType.GYM]: "sport_type_gym",
        [client_1.SportType.RUNNING]: "sport_type_running",
        [client_1.SportType.SWIMMING]: "sport_type_swimming",
        [client_1.SportType.FOOTBALL]: "sport_type_football",
        [client_1.SportType.BASKETBALL]: "sport_type_basketball",
        [client_1.SportType.TENNIS]: "sport_type_tennis",
        [client_1.SportType.MARTIAL_ARTS]: "sport_type_martial_arts",
        [client_1.SportType.YOGA]: "sport_type_yoga",
        [client_1.SportType.CYCLING]: "sport_type_cycling",
        [client_1.SportType.CLIMBING]: "sport_type_climbing",
        [client_1.SportType.SKI_SNOWBOARD]: "sport_type_ski_snowboard"
    };
    return names[type] || "unknown";
}
// Получить имя типа игры
function getGameTypeName(type) {
    const names = {
        [client_1.GameType.CS_GO]: "game_type_cs_go",
        [client_1.GameType.DOTA2]: "game_type_dota2",
        [client_1.GameType.VALORANT]: "game_type_valorant",
        [client_1.GameType.RUST]: "game_type_rust",
        [client_1.GameType.MINECRAFT]: "game_type_minecraft",
        [client_1.GameType.LEAGUE_OF_LEGENDS]: "game_type_league_of_legends",
        [client_1.GameType.FORTNITE]: "game_type_fortnite",
        [client_1.GameType.PUBG]: "game_type_pubg",
        [client_1.GameType.GTA]: "game_type_gta",
        [client_1.GameType.APEX_LEGENDS]: "game_type_apex_legends",
        [client_1.GameType.FIFA]: "game_type_fifa",
        [client_1.GameType.CALL_OF_DUTY]: "game_type_call_of_duty",
        [client_1.GameType.WOW]: "game_type_wow",
        [client_1.GameType.GENSHIN_IMPACT]: "game_type_genshin_impact"
    };
    return names[type] || "unknown";
}
// Получить имя типа хобби
function getHobbyTypeName(type) {
    const names = {
        [client_1.HobbyType.MUSIC]: "hobby_type_music",
        [client_1.HobbyType.DRAWING]: "hobby_type_drawing",
        [client_1.HobbyType.PHOTOGRAPHY]: "hobby_type_photography",
        [client_1.HobbyType.COOKING]: "hobby_type_cooking",
        [client_1.HobbyType.CRAFTS]: "hobby_type_crafts",
        [client_1.HobbyType.DANCING]: "hobby_type_dancing",
        [client_1.HobbyType.READING]: "hobby_type_reading"
    };
    return names[type] || "unknown";
}
// Получить имя типа IT
function getITTypeName(type) {
    const names = {
        [client_1.ITType.FRONTEND]: "it_type_frontend",
        [client_1.ITType.BACKEND]: "it_type_backend",
        [client_1.ITType.FULLSTACK]: "it_type_fullstack",
        [client_1.ITType.MOBILE]: "it_type_mobile",
        [client_1.ITType.DEVOPS]: "it_type_devops",
        [client_1.ITType.QA]: "it_type_qa",
        [client_1.ITType.DATA_SCIENCE]: "it_type_data_science",
        [client_1.ITType.GAME_DEV]: "it_type_game_dev",
        [client_1.ITType.CYBERSECURITY]: "it_type_cybersecurity",
        [client_1.ITType.UI_UX]: "it_type_ui_ux"
    };
    return names[type] || "unknown";
}
function getProfileModelName(profileType) {
    switch (profileType) {
        case client_1.ProfileType.RELATIONSHIP:
            return 'relationshipProfile';
        case client_1.ProfileType.SPORT:
            return 'sportProfile';
        case client_1.ProfileType.GAME:
            return 'gameProfile';
        case client_1.ProfileType.HOBBY:
            return 'hobbyProfile';
        case client_1.ProfileType.IT:
            return 'iTProfile';
        case client_1.ProfileType.TRAVEL:
            return 'travelProfile';
        default:
            return 'relationshipProfile';
    }
}
