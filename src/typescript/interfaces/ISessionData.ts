export interface ISessionData {
    step?: "choose_language_start" | "profile" | "prepare_message" | "choose_language" | "accept_privacy" | 'questions';
    question?: 'years' | 'gender' | 'interested_in' | 'city' | "name" | "text" | "file" | "all_right";
    form: {
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
        file: string;
        myCoordinates?: boolean;
        isFinished: boolean;
    };
    isNeededSubscription?: boolean;
}