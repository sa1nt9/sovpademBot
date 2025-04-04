import { User, ProfileType, SportType, GameType, HobbyType, ITType } from "@prisma/client";
import { IProfile, IProfileInfo, TProfileSubType } from "./IProfile";

interface IAdditionalFormInfo {
    canGoBack: boolean;
    awaitingLikeContent?: boolean;
    showLikes?: boolean;
    reportType?: string;
    searchingLikes?: boolean;
    reportedUserId?: string;
    selectedProfileType?: ProfileType;
    selectedSubType?: TProfileSubType;
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
    "roulette_searching" |
    "add_private_note" |
    "added_private_note" | 
    "options_to_user" |
    "blacklist_user" |
    "go_main_menu" | 
    "start_using_bot" |
    "choose_profile_type" |
    "switch_profile" |
    "select_subtype" |
    "transfer_media" |
    "create_profile_type" |
    "create_profile_subtype" |
    "you_already_have_this_profile"

type TQuestion =
    'years' |
    'gender' |
    'interested_in' |
    'city' |
    "name" |
    "text" |
    "file" |
    "add_another_file" |
    "all_right" |
    "sport_level" |
    "game_rank" |
    "game_account" |
    "it_experience" |
    "it_technologies" |
    "it_github";

export interface ISessionData {
    step?: TStep;
    question?: TQuestion;
    additionalFormInfo: IAdditionalFormInfo;
    privacyAccepted: boolean;
    referrerId?: string;
    activeProfile: IProfile; // Текущий активный профиль пользователя
    availableProfiles?: IProfileInfo[]; // Список доступных профилей пользователя
    isNeededSubscription?: boolean;
    currentCandidateProfile?: IProfile | null; // Профиль текущего кандидата
    currentBlacklistedUser?: User | null;
    pendingMutualLike?: boolean;
    pendingMutualLikeProfileId?: string; // ID профиля, с которым установлена взаимная симпатия
    pendingMutualLikeProfileType?: ProfileType; // Тип профиля, с которым установлена взаимная симпатия
    roulette?: IRouletteData;
    originalReactionMessage?: IOriginalReactionMessage;
    privateNote?: string;
}