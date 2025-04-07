import { IFile } from "./IFile";
import { ProfileType, SportType, GameType, HobbyType, ITType, User } from "@prisma/client";

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
    user?: User;
}

export type TInterestedIn = 'male' | 'female' | 'all';

// Интерфейс для профиля отношений
export interface IRelationshipProfile extends IBaseProfile {
    profileType: 'RELATIONSHIP';
    interestedIn: TInterestedIn;
}

// Интерфейс для спортивного профиля
export interface ISportProfile extends IBaseProfile {
    profileType: 'SPORT';
    subType: SportType;
    level?: string;
    interestedIn: TInterestedIn;
}

// Интерфейс для игрового профиля
export interface IGameProfile extends IBaseProfile {
    profileType: 'GAME';
    subType: GameType;
    accountLink?: string;
    interestedIn: TInterestedIn;
}

// Интерфейс для хобби-профиля
export interface IHobbyProfile extends IBaseProfile {
    profileType: 'HOBBY';
    subType: HobbyType;
    interestedIn: TInterestedIn;
}

// Интерфейс для IT-профиля
export interface IItProfile extends IBaseProfile {
    profileType: 'IT';
    subType: ITType;
    experience: string;
    technologies?: string;
    github?: string;
    interestedIn: TInterestedIn;
}

// Объединенный тип для всех профилей
export type IProfile =
    | IRelationshipProfile
    | ISportProfile
    | IGameProfile
    | IHobbyProfile
    | IItProfile;

export type TProfileSubType = SportType | GameType | HobbyType | ITType;

// Информация о профиле для выбора
export interface IProfileInfo {
    profileType: ProfileType;
    subType?: TProfileSubType;
    name: string;
    description?: string;
    isActive: boolean;
} 