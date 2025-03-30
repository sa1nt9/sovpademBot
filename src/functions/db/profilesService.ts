import { prisma } from "../../db/postgres";
import { ProfileType, SportType, GameType, HobbyType, ITType } from "@prisma/client";
import { IProfile, IProfileInfo, IRelationshipProfile, ISportProfile, IGameProfile, IHobbyProfile, IITProfile, ITravelProfile } from "../../typescript/interfaces/IProfile";
import { IFile } from "../../typescript/interfaces/IFile";
import { logger } from "../../logger";
import { MyContext } from "../../typescript/context";

// Получить все профили пользователя
export async function getUserProfiles(userId: string, ctx?: MyContext): Promise<IProfileInfo[]> {
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
    
    const it = await prisma.iTProfile.findMany({
        where: { userId }
    });
    
    const travel = await prisma.travelProfile.findUnique({
        where: { userId }
    });
    
    const profiles: IProfileInfo[] = [];
    
    if (relationship) {
        profiles.push({
            profileType: ProfileType.RELATIONSHIP,
            name: ctx ? ctx.t('profile_type_relationship') : "Relationship",
            isActive: relationship.isActive
        });
    }
    
    sports.forEach(sport => {
        profiles.push({
            profileType: ProfileType.SPORT,
            subType: sport.sportType,
            name: ctx ? `${ctx.t('profile_type_sport')}: ${ctx.t(getSportTypeName(sport.sportType))}` : `Sport: ${getSportTypeName(sport.sportType)}`,
            isActive: sport.isActive
        });
    });
    
    games.forEach(game => {
        profiles.push({
            profileType: ProfileType.GAME,
            subType: game.gameType,
            name: ctx ? `${ctx.t('profile_type_game')}: ${ctx.t(getGameTypeName(game.gameType))}` : `Game: ${getGameTypeName(game.gameType)}`,
            isActive: game.isActive
        });
    });
    
    hobbies.forEach(hobby => {
        profiles.push({
            profileType: ProfileType.HOBBY,
            subType: hobby.hobbyType,
            name: ctx ? `${ctx.t('profile_type_hobby')}: ${ctx.t(getHobbyTypeName(hobby.hobbyType))}` : `Hobby: ${getHobbyTypeName(hobby.hobbyType)}`,
            isActive: hobby.isActive
        });
    });
    
    it.forEach(itProfile => {
        profiles.push({
            profileType: ProfileType.IT,
            subType: itProfile.itType,
            name: ctx ? `${ctx.t('profile_type_it')}: ${ctx.t(getITTypeName(itProfile.itType))}` : `IT: ${getITTypeName(itProfile.itType)}`,
            isActive: itProfile.isActive
        });
    });
    
    if (travel) {
        profiles.push({
            profileType: ProfileType.TRAVEL,
            name: ctx ? ctx.t('profile_type_travel') : "Travel",
            isActive: travel.isActive
        });
    }
    
    return profiles;
}

// Получить конкретный профиль пользователя
export async function getUserProfile(
    userId: string, 
    profileType: ProfileType, 
    subType?: SportType | GameType | HobbyType | ITType
): Promise<IProfile | null> {
    switch (profileType) {
        case ProfileType.RELATIONSHIP: {
            const profile = await prisma.relationshipProfile.findUnique({
                where: { userId }
            });
            
            if (!profile) return null;
            
            return {
                ...profile,
                profileType: 'RELATIONSHIP',
                files: JSON.parse(profile.files as string) as IFile[]
            } as IRelationshipProfile;
        }
        
        case ProfileType.SPORT: {
            if (!subType) return null;
            
            const profile = await prisma.sportProfile.findUnique({
                where: { 
                    userId_sportType: {
                        userId,
                        sportType: subType as SportType
                    }
                }
            });
            
            if (!profile) return null;
            
            return {
                ...profile,
                profileType: 'SPORT',
                files: JSON.parse(profile.files as string) as IFile[]
            } as ISportProfile;
        }
        
        case ProfileType.GAME: {
            if (!subType) return null;
            
            const profile = await prisma.gameProfile.findUnique({
                where: { 
                    userId_gameType: {
                        userId,
                        gameType: subType as GameType
                    }
                }
            });
            
            if (!profile) return null;
            
            return {
                ...profile,
                profileType: 'GAME',
                files: JSON.parse(profile.files as string) as IFile[]
            } as IGameProfile;
        }
        
        case ProfileType.HOBBY: {
            if (!subType) return null;
            
            const profile = await prisma.hobbyProfile.findUnique({
                where: { 
                    userId_hobbyType: {
                        userId,
                        hobbyType: subType as HobbyType
                    }
                }
            });
            
            if (!profile) return null;
            
            return {
                ...profile,
                profileType: 'HOBBY',
                files: JSON.parse(profile.files as string) as IFile[]
            } as IHobbyProfile;
        }
        
        case ProfileType.IT: {
            if (!subType) return null;
            
            const profile = await prisma.iTProfile.findUnique({
                where: { 
                    userId_itType: {
                        userId,
                        itType: subType as ITType
                    }
                }
            });
            
            if (!profile) return null;
            
            return {
                ...profile,
                profileType: 'IT',
                files: JSON.parse(profile.files as string) as IFile[]
            } as IITProfile;
        }
        
        case ProfileType.TRAVEL: {
            const profile = await prisma.travelProfile.findUnique({
                where: { userId }
            });
            
            if (!profile) return null;
            
            return {
                ...profile,
                profileType: 'TRAVEL',
                files: JSON.parse(profile.files as string) as IFile[]
            } as ITravelProfile;
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
            
            return {
                ...saved,
                profileType: 'RELATIONSHIP',
                files: profile.files
            } as IRelationshipProfile;
        }
        
        case 'SPORT': {
            const sportProfile = profile as ISportProfile;
            
            const saved = await prisma.sportProfile.upsert({
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
            
            return {
                ...saved,
                profileType: 'SPORT',
                files: profile.files
            } as ISportProfile;
        }
        
        case 'GAME': {
            const gameProfile = profile as IGameProfile;
            
            const saved = await prisma.gameProfile.upsert({
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
            
            return {
                ...saved,
                profileType: 'GAME',
                files: profile.files
            } as IGameProfile;
        }
        
        case 'HOBBY': {
            const hobbyProfile = profile as IHobbyProfile;
            
            const saved = await prisma.hobbyProfile.upsert({
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
            
            return {
                ...saved,
                profileType: 'HOBBY',
                files: profile.files
            } as IHobbyProfile;
        }
        
        case 'IT': {
            const itProfile = profile as IITProfile;
            
            const saved = await prisma.iTProfile.upsert({
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
            
            return {
                ...saved,
                profileType: 'IT',
                files: profile.files
            } as IITProfile;
        }
        
        case 'TRAVEL': {
            const travelProfile = profile as ITravelProfile;
            
            const saved = await prisma.travelProfile.upsert({
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
            
            return {
                ...saved,
                profileType: 'TRAVEL',
                files: profile.files
            } as ITravelProfile;
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
                        userId_sportType: {
                            userId,
                            sportType: subType as SportType
                        }
                    },
                    data: { isActive }
                });
                break;
                
            case ProfileType.GAME:
                if (!subType) return false;
                await prisma.gameProfile.update({
                    where: { 
                        userId_gameType: {
                            userId,
                            gameType: subType as GameType
                        }
                    },
                    data: { isActive }
                });
                break;
                
            case ProfileType.HOBBY:
                if (!subType) return false;
                await prisma.hobbyProfile.update({
                    where: { 
                        userId_hobbyType: {
                            userId,
                            hobbyType: subType as HobbyType
                        }
                    },
                    data: { isActive }
                });
                break;
                
            case ProfileType.IT:
                if (!subType) return false;
                await prisma.iTProfile.update({
                    where: { 
                        userId_itType: {
                            userId,
                            itType: subType as ITType
                        }
                    },
                    data: { isActive }
                });
                break;
                
            case ProfileType.TRAVEL:
                await prisma.travelProfile.update({
                    where: { userId },
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
        case ProfileType.TRAVEL:
            return 'travelProfile';
        default:
            return 'relationshipProfile';
    }
}