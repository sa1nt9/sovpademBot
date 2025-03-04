import { IFile } from "./IFile";

export interface IUser {
    name: string;
    previous_name?: string;
    city: string;
    location: {
        longitude: number;
        latitude: number;
    };
    gender: 'male' | 'female';
    interestedIn: "male" | "female" | "all";
    age: number;
    text: string;
    files: IFile[];
    temp_files: IFile[];
    ownCoordinates?: boolean;
    isFinished: boolean;
}