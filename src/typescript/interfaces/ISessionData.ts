import { User } from "@prisma/client";
import { IUser } from "./IUser";

interface AdditionalFormInfo {
    canGoBack: boolean;
    awaitingLikeContent?: boolean;
}

export interface ISessionData {
    step?: "choose_language_start" | "profile" | "prepare_message" | "choose_language" | "accept_privacy" | 'questions' | "search_people" | "sleep_menu" | "disable_form" | "friends" | 'form_disabled' | 'you_dont_have_form' | 'text_or_video_to_user';
    question?: 'years' | 'gender' | 'interested_in' | 'city' | "name" | "text" | "file" | "add_another_file" |  "all_right";
    additionalFormInfo: AdditionalFormInfo
    privacyAccepted: boolean;
    form: IUser;
    isNeededSubscription?: boolean;
    currentCandidate?: User | null;
}