import { User } from "@prisma/client";
import { IUser } from "./IUser";

interface IAdditionalFormInfo {
    canGoBack: boolean;
    awaitingLikeContent?: boolean;
    showLikes?: boolean;
    reportType?: string;
    searchingLikes?: boolean;
    reportedUserId?: string;
}

interface IRouletteData {
    chatPartnerId: string | null;
    searchingPartner: boolean;
}

interface IOriginalReactionMessage {
    text: string;
    messageId: number;
    chatId: number;
}

type TStep =
    "choose_language_start" |
    "profile" |
    "prepare_message" |
    "choose_language" |
    "accept_privacy" |
    'questions' |
    "search_people" |
    "sleep_menu" |
    "disable_form" |
    "friends" |
    'form_disabled' |
    'you_dont_have_form' |
    'text_or_video_to_user' |
    'somebodys_liked_you' |
    'search_people_with_likes' |
    "continue_see_forms" |
    "continue_see_likes_forms" |
    "complain" |
    "complain_text" |
    "cannot_send_complain" | 
    "roulette_start" |
    "roulette_searching"

type TQuestion =
    'years' |
    'gender' |
    'interested_in' |
    'city' |
    "name" |
    "text" |
    "file" |
    "add_another_file" |
    "all_right";

export interface ISessionData {
    step?: TStep;
    question?: TQuestion;
    additionalFormInfo: IAdditionalFormInfo;
    privacyAccepted: boolean;
    referrerId?: string;
    form: IUser;
    isNeededSubscription?: boolean;
    currentCandidate?: User | null;
    pendingMutualLike?: boolean;
    pendingMutualLikeUserId?: string;
    roulette?: IRouletteData;
    originalReactionMessage?: IOriginalReactionMessage;
}