import { IUser } from "./IUser";

export interface ISessionData {
    step?: "choose_language_start" | "profile" | "prepare_message" | "choose_language" | "accept_privacy" | 'questions' | "search_people";
    question?: 'years' | 'gender' | 'interested_in' | 'city' | "name" | "text" | "file" | "add_another_file" |  "all_right";
    additionalFormInfo: {
        canGoBack: boolean
    }
    privacyAccepted: boolean;
    form: IUser;
    isNeededSubscription?: boolean;
}