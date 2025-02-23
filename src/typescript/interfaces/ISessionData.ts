export interface ISessionData {
    step?: "choose_language_start" | "profile" | "prepare_message" | "choose_language" | "accept_privacy" | 'questions';
    question?: 'years' | 'gender' | 'interested_in' | 'city' | "name" | "text" | "file" | "all_right"
}