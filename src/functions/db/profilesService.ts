import { prisma } from "../../db/postgres";
import { ProfileType, SportType, GameType, HobbyType, ITType } from "@prisma/client";
import { IProfile, IProfileInfo, IRelationshipProfile, ISportProfile, IGameProfile, IHobbyProfile, IItProfile, TProfileSubType } from "../../typescript/interfaces/IProfile";
import { IFile } from "../../typescript/interfaces/IFile";
import { logger } from "../../logger";
import { MyContext } from "../../typescript/context";
import { TranslateFunction } from "@grammyjs/i18n";
// Получить все профили пользователя
export async function getUserProfiles(userId: string, ctx: MyContext): Promise<IProfileInfo[]> {
    const relationship = await prisma.relationshipProfile.findUnique({
        where: { userId }
    });

    const sports = await prisma.sportProfile.findMany({
        where: { userId }
    });

    const games = await prisma.gameProfile.findMany({
        where: { userId }
    });

    const hobbies = await prisma.hobbyProfile.findMany({
        where: { userId }
    });

    const it = await prisma.itProfile.findMany({
        where: { userId }
    });


    const profiles: IProfileInfo[] = [];

    if (relationship) {
        profiles.push({
            profileType: ProfileType.RELATIONSHIP,
            name: ctx.t('profile_type_relationship'),
            isActive: relationship.isActive
        });
    }

    sports.forEach(sport => {
        profiles.push({
            profileType: ProfileType.SPORT,
            subType: sport.subType,
            name: `${ctx.t('profile_type_sport')}: ${ctx.t(getSportTypeName(sport.subType))}`,
            isActive: sport.isActive
        });
    });

    games.forEach(game => {
        profiles.push({
            profileType: ProfileType.GAME,
            subType: game.subType,
            name: `${ctx.t('profile_type_game')}: ${ctx.t(getGameTypeName(game.subType))}`,
            isActive: game.isActive
        });
    });

    hobbies.forEach(hobby => {
        profiles.push({
            profileType: ProfileType.HOBBY,
            subType: hobby.subType,
            name: `${ctx.t('profile_type_hobby')}: ${ctx.t(getHobbyTypeName(hobby.subType))}`,
            isActive: hobby.isActive
        });
    });

    it.forEach(itProfile => {
        profiles.push({
            profileType: ProfileType.IT,
            subType: itProfile.subType,
            name: `${ctx.t('profile_type_it')}: ${ctx.t(getITTypeName(itProfile.subType))}`,
            isActive: itProfile.isActive
        });
    });


    return profiles;
}

// Получить конкретный профиль пользователя
export async function getUserProfile(
    userId: string,
    profileType: ProfileType,
    subType?: TProfileSubType
): Promise<IProfile | null> {
    switch (profileType) {
        case ProfileType.RELATIONSHIP: {
            const profile = await prisma.relationshipProfile.findUnique({
                where: { userId }
            });

            if (!profile) return null;

            return {
                ...profile,
                files: JSON.parse(profile.files as string) as IFile[] || []
            } as IRelationshipProfile;
        }

        case ProfileType.SPORT: {
            if (!subType) return null;

            const profile = await prisma.sportProfile.findUnique({
                where: {
                    userId_subType: {
                        userId,
                        subType: subType as SportType
                    }
                }
            });

            if (!profile) return null;

            return {
                ...profile,
                files: JSON.parse(profile.files as string) as IFile[]
            } as ISportProfile;
        }

        case ProfileType.GAME: {
            if (!subType) return null;

            const profile = await prisma.gameProfile.findUnique({
                where: {
                    userId_subType: {
                        userId,
                        subType: subType as GameType
                    }
                }
            });

            if (!profile) return null;

            return {
                ...profile,
                files: JSON.parse(profile.files as string) as IFile[]
            } as IGameProfile;
        }

        case ProfileType.HOBBY: {
            if (!subType) return null;

            const profile = await prisma.hobbyProfile.findUnique({
                where: {
                    userId_subType: {
                        userId,
                        subType: subType as HobbyType
                    }
                }
            });

            if (!profile) return null;

            return {
                ...profile,
                files: JSON.parse(profile.files as string) as IFile[]
            } as IHobbyProfile;
        }

        case ProfileType.IT: {
            if (!subType) return null;

            const profile = await prisma.itProfile.findUnique({
                where: {
                    userId_subType: {
                        userId,
                        subType: subType as ITType
                    }
                }
            });

            if (!profile) return null;

            return {
                ...profile,
                files: JSON.parse(profile.files as string) as IFile[]
            } as IItProfile;
        }


        default:
            return null;
    }
}

// Сохранить профиль пользователя
export async function saveProfile(profile: IProfile): Promise<IProfile> {
    const fileJson = JSON.stringify(profile.files);

    switch (profile.profileType) {
        case 'RELATIONSHIP': {
            const relationshipProfile = profile as IRelationshipProfile;

            const saved = await prisma.relationshipProfile.upsert({
                where: { userId: profile.userId },
                update: {
                    interestedIn: relationshipProfile.interestedIn,
                    description: relationshipProfile.description,
                    files: fileJson,
                },
                create: {
                    userId: profile.userId,
                    interestedIn: relationshipProfile.interestedIn,
                    description: relationshipProfile.description,
                    files: fileJson,
                }
            });

            return {
                ...saved,
                files: profile.files
            } as IRelationshipProfile;
        }

        case 'SPORT': {
            const sportProfile = profile as ISportProfile;

            const saved = await prisma.sportProfile.upsert({
                where: {
                    userId_subType: {
                        userId: profile.userId,
                        subType: sportProfile.subType
                    }
                },
                update: {
                    level: sportProfile.level,
                    description: profile.description,
                    interestedIn: sportProfile.interestedIn,
                    files: fileJson,
                },
                create: {
                    userId: profile.userId,
                    subType: sportProfile.subType,
                    interestedIn: sportProfile.interestedIn,
                    level: sportProfile.level,
                    description: profile.description,
                    files: fileJson,
                }
            });

            return {
                ...saved,
                files: profile.files
            } as ISportProfile;
        }

        case 'GAME': {
            const gameProfile = profile as IGameProfile;

            const saved = await prisma.gameProfile.upsert({
                where: {
                    userId_subType: {
                        userId: profile.userId,
                        subType: gameProfile.subType
                    }
                },
                update: {
                    accountLink: gameProfile.accountLink,
                    description: profile.description,
                    interestedIn: gameProfile.interestedIn,
                    files: fileJson,
                },
                create: {
                    userId: profile.userId,
                    subType: gameProfile.subType,
                    accountLink: gameProfile.accountLink,
                    interestedIn: gameProfile.interestedIn,
                    description: profile.description,
                    files: fileJson,
                }
            });

            return {
                ...saved,
                files: profile.files
            } as IGameProfile;
        }

        case 'HOBBY': {
            const hobbyProfile = profile as IHobbyProfile;

            const saved = await prisma.hobbyProfile.upsert({
                where: {
                    userId_subType: {
                        userId: profile.userId,
                        subType: hobbyProfile.subType
                    }
                },
                update: {
                    description: profile.description,
                    interestedIn: hobbyProfile.interestedIn,
                    files: fileJson,
                },
                create: {
                    userId: profile.userId,
                    subType: hobbyProfile.subType,
                    interestedIn: hobbyProfile.interestedIn,
                    description: profile.description,
                    files: fileJson,
                }
            });

            return {
                ...saved,
                files: profile.files
            } as IHobbyProfile;
        }

        case 'IT': {
            const itProfile = profile as IItProfile;

            const saved = await prisma.itProfile.upsert({
                where: {
                    userId_subType: {
                        userId: profile.userId,
                        subType: itProfile.subType
                    }
                },
                update: {
                    interestedIn: itProfile.interestedIn,
                    experience: itProfile.experience,
                    technologies: itProfile.technologies,
                    github: itProfile.github,
                    description: profile.description,
                    files: fileJson,
                },
                create: {
                    userId: profile.userId,
                    subType: itProfile.subType,
                    experience: itProfile.experience,
                    technologies: itProfile.technologies,
                    github: itProfile.github,
                    description: profile.description,
                    interestedIn: itProfile.interestedIn,
                    files: fileJson,
                }
            });

            return {
                ...saved,
                files: profile.files
            } as IItProfile;
        }

        default:
            throw new Error(`Неизвестный тип профиля: ${(profile as any).profileType}`);
    }
}

// Включить/выключить профиль
export async function toggleProfileActive(
    userId: string,
    profileType: ProfileType,
    isActive: boolean,
    subType?: SportType | GameType | HobbyType | ITType
): Promise<boolean> {
    try {
        switch (profileType) {
            case ProfileType.RELATIONSHIP:
                await prisma.relationshipProfile.update({
                    where: { userId },
                    data: { isActive }
                });
                break;

            case ProfileType.SPORT:
                if (!subType) return false;
                await prisma.sportProfile.update({
                    where: {
                        userId_subType: {
                            userId,
                            subType: subType as SportType
                        }
                    },
                    data: { isActive }
                });
                break;

            case ProfileType.GAME:
                if (!subType) return false;
                await prisma.gameProfile.update({
                    where: {
                        userId_subType: {
                            userId,
                            subType: subType as GameType
                        }
                    },
                    data: { isActive }
                });
                break;

            case ProfileType.HOBBY:
                if (!subType) return false;
                await prisma.hobbyProfile.update({
                    where: {
                        userId_subType: {
                            userId,
                            subType: subType as HobbyType
                        }
                    },
                    data: { isActive }
                });
                break;

            case ProfileType.IT:
                if (!subType) return false;
                await prisma.itProfile.update({
                    where: {
                        userId_subType: {
                            userId,
                            subType: subType as ITType
                        }
                    },
                    data: { isActive }
                });
                break;


            default:
                return false;
        }

        return true;
    } catch (error) {
        logger.error({
            error,
            action: 'Error updating profile status',
            userId,
            profileType,
            subType
        });
        return false;
    }
}

// Получить имя типа спорта
function getSportTypeName(type: SportType): string {
    const names: Record<SportType, string> = {
        [SportType.GYM]: "sport_type_gym",
        [SportType.RUNNING]: "sport_type_running",
        [SportType.SWIMMING]: "sport_type_swimming",
        [SportType.FOOTBALL]: "sport_type_football",
        [SportType.BASKETBALL]: "sport_type_basketball",
        [SportType.TENNIS]: "sport_type_tennis",
        [SportType.MARTIAL_ARTS]: "sport_type_martial_arts",
        [SportType.YOGA]: "sport_type_yoga",
        [SportType.CYCLING]: "sport_type_cycling",
        [SportType.CLIMBING]: "sport_type_climbing",
        [SportType.SKI_SNOWBOARD]: "sport_type_ski_snowboard"
    };

    return names[type] || "unknown";
}

// Получить имя типа игры
function getGameTypeName(type: GameType): string {
    const names: Record<GameType, string> = {
        [GameType.CS_GO]: "game_type_cs_go",
        [GameType.DOTA2]: "game_type_dota2",
        [GameType.VALORANT]: "game_type_valorant",
        [GameType.RUST]: "game_type_rust",
        [GameType.MINECRAFT]: "game_type_minecraft",
        [GameType.LEAGUE_OF_LEGENDS]: "game_type_league_of_legends",
        [GameType.FORTNITE]: "game_type_fortnite",
        [GameType.PUBG]: "game_type_pubg",
        [GameType.GTA]: "game_type_gta",
        [GameType.APEX_LEGENDS]: "game_type_apex_legends",
        [GameType.FIFA]: "game_type_fifa",
        [GameType.CALL_OF_DUTY]: "game_type_call_of_duty",
        [GameType.WOW]: "game_type_wow",
        [GameType.GENSHIN_IMPACT]: "game_type_genshin_impact"
    };

    return names[type] || "unknown";
}

// Получить имя типа хобби
function getHobbyTypeName(type: HobbyType): string {
    const names: Record<HobbyType, string> = {
        [HobbyType.MUSIC]: "hobby_type_music",
        [HobbyType.DRAWING]: "hobby_type_drawing",
        [HobbyType.PHOTOGRAPHY]: "hobby_type_photography",
        [HobbyType.COOKING]: "hobby_type_cooking",
        [HobbyType.CRAFTS]: "hobby_type_crafts",
        [HobbyType.DANCING]: "hobby_type_dancing",
        [HobbyType.READING]: "hobby_type_reading"
    };

    return names[type] || "unknown";
}

// Получить имя типа IT
function getITTypeName(type: ITType): string {
    const names: Record<ITType, string> = {
        [ITType.FRONTEND]: "it_type_frontend",
        [ITType.BACKEND]: "it_type_backend",
        [ITType.FULLSTACK]: "it_type_fullstack",
        [ITType.MOBILE]: "it_type_mobile",
        [ITType.DEVOPS]: "it_type_devops",
        [ITType.QA]: "it_type_qa",
        [ITType.DATA_SCIENCE]: "it_type_data_science",
        [ITType.GAME_DEV]: "it_type_game_dev",
        [ITType.CYBERSECURITY]: "it_type_cybersecurity",
        [ITType.UI_UX]: "it_type_ui_ux"
    };

    return names[type] || "unknown";
}
export const getProfileTypeLocalizations = (t: TranslateFunction) => ({
    [t("profile_type_relationship")]: ProfileType.RELATIONSHIP,
    [t("profile_type_sport")]: ProfileType.SPORT,
    [t("profile_type_game")]: ProfileType.GAME,
    [t("profile_type_hobby")]: ProfileType.HOBBY,
    [t("profile_type_it")]: ProfileType.IT
})

export const getSubtypeLocalizations = (t: TranslateFunction) => ({
    sport: {
        [t("sport_type_gym")]: SportType.GYM,
        [t("sport_type_running")]: SportType.RUNNING,
        [t("sport_type_swimming")]: SportType.SWIMMING,
        [t("sport_type_football")]: SportType.FOOTBALL,
        [t("sport_type_basketball")]: SportType.BASKETBALL,
        [t("sport_type_tennis")]: SportType.TENNIS,
        [t("sport_type_martial_arts")]: SportType.MARTIAL_ARTS,
        [t("sport_type_yoga")]: SportType.YOGA,
        [t("sport_type_cycling")]: SportType.CYCLING,
        [t("sport_type_climbing")]: SportType.CLIMBING,
        [t("sport_type_ski_snowboard")]: SportType.SKI_SNOWBOARD,
    },

    // IT subtypes
    it: {
        [t("it_type_frontend")]: ITType.FRONTEND,
        [t("it_type_backend")]: ITType.BACKEND,
        [t("it_type_fullstack")]: ITType.FULLSTACK,
        [t("it_type_mobile")]: ITType.MOBILE,
        [t("it_type_devops")]: ITType.DEVOPS,
        [t("it_type_qa")]: ITType.QA,
        [t("it_type_data_science")]: ITType.DATA_SCIENCE,
        [t("it_type_game_dev")]: ITType.GAME_DEV,
        [t("it_type_cybersecurity")]: ITType.CYBERSECURITY,
        [t("it_type_ui_ux")]: ITType.UI_UX,
    },
    // Game subtypes
    game: {
        [t("game_type_cs_go")]: GameType.CS_GO,
        [t("game_type_dota2")]: GameType.DOTA2,
        [t("game_type_valorant")]: GameType.VALORANT,
        [t("game_type_rust")]: GameType.RUST,
        [t("game_type_minecraft")]: GameType.MINECRAFT,
        [t("game_type_league_of_legends")]: GameType.LEAGUE_OF_LEGENDS,
        [t("game_type_fortnite")]: GameType.FORTNITE,
        [t("game_type_pubg")]: GameType.PUBG,
        [t("game_type_gta")]: GameType.GTA,
        [t("game_type_apex_legends")]: GameType.APEX_LEGENDS,
        [t("game_type_fifa")]: GameType.FIFA,
        [t("game_type_call_of_duty")]: GameType.CALL_OF_DUTY,
        [t("game_type_wow")]: GameType.WOW,
        [t("game_type_genshin_impact")]: GameType.GENSHIN_IMPACT,
    },

    // Hobby subtypes
    hobby: {
        [t("hobby_type_music")]: HobbyType.MUSIC,
        [t("hobby_type_drawing")]: HobbyType.DRAWING,
        [t("hobby_type_photography")]: HobbyType.PHOTOGRAPHY,
        [t("hobby_type_cooking")]: HobbyType.COOKING,
        [t("hobby_type_crafts")]: HobbyType.CRAFTS,
        [t("hobby_type_dancing")]: HobbyType.DANCING,
        [t("hobby_type_reading")]: HobbyType.READING
    }
})

export const findKeyByValue = (t: TranslateFunction, value: any, object: Record<string, any>): string | undefined => {

    // Ищем ключ по значению
    for (const [key, val] of Object.entries(object)) {
        if (val === value) {
            return key;
        }
    }

    return undefined;
}

export function getProfileModelName(profileType: ProfileType): string {
    switch (profileType) {
        case ProfileType.RELATIONSHIP:
            return 'relationshipProfile';
        case ProfileType.SPORT:
            return 'sportProfile';
        case ProfileType.GAME:
            return 'gameProfile';
        case ProfileType.HOBBY:
            return 'hobbyProfile';
        case ProfileType.IT:
            return 'iTProfile';
        default:
            return 'relationshipProfile';
    }
}