import { IFile } from "./IFile";
import { ProfileType, SportType, GameType, HobbyType, ITType } from "@prisma/client";

// Базовый интерфейс для всех профилей
export interface IBaseProfile {
    id: string;
    userId: string;
    name: string;
    previousName?: string;
    description: string;
    city: string;
    location: {
        longitude: number;
        latitude: number;
    };
    files: IFile[];
    tempFiles: IFile[];
    ownCoordinates?: boolean;
    age: number;
    gender: 'male' | 'female';
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isFinished?: boolean;
}

// Интерфейс для профиля отношений
export interface IRelationshipProfile extends IBaseProfile {
    profileType: 'RELATIONSHIP';
    interestedIn: 'male' | 'female' | 'all';
}

// Интерфейс для спортивного профиля
export interface ISportProfile extends IBaseProfile {
    profileType: 'SPORT';
    sportType: SportType;
    level?: string;
}

// Интерфейс для игрового профиля
export interface IGameProfile extends IBaseProfile {
    profileType: 'GAME';
    gameType: GameType;
    rank?: string;
    accountLink?: string;
}

// Интерфейс для хобби-профиля
export interface IHobbyProfile extends IBaseProfile {
    profileType: 'HOBBY';
    hobbyType: HobbyType;
}

// Интерфейс для IT-профиля
export interface IITProfile extends IBaseProfile {
    profileType: 'IT';
    itType: ITType;
    experience?: string;
    technologies?: string;
    portfolioLink?: string;
}

// Интерфейс для профиля путешествий
export interface ITravelProfile extends IBaseProfile {
    profileType: 'TRAVEL';
}

// Объединенный тип для всех профилей
export type IProfile = 
    | IRelationshipProfile 
    | ISportProfile 
    | IGameProfile 
    | IHobbyProfile 
    | IITProfile 
    | ITravelProfile;

// Информация о профиле для выбора
export interface IProfileInfo {
    profileType: ProfileType;
    subType?: SportType | GameType | HobbyType | ITType;
    name: string;
    description?: string;
    isActive: boolean;
} 