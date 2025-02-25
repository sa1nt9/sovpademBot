import { ISessionData } from "../typescript/interfaces/ISessionData";

export function sessionInitial(): ISessionData {
    return {
        step: "choose_language_start",
        question: 'years',
        form: {
            name: '',
            previous_name: '',
            city: '',
            location: {
                longitude: 0,
                latitude: 0,
            },
            gender: 'male',
            interestedIn: 'all',
            age: 0,
            text: '',
            file: '',
            myCoordinates: false,
            isFinished: false
        }
    };
}