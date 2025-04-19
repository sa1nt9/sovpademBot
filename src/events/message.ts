import { acceptPrivacyStep } from "../messages/accept_privacy"
import { addPrivateNoteStep } from "../messages/add_private_note"
import { blacklistUserStep } from "../messages/blacklist_user"
import { cannotSendComplainStep } from "../messages/cannot_send_complain"
import { chooseLanguageStep } from "../messages/choose_language"
import { chooseLanguageStartStep } from "../messages/choose_language_start"
import { complainStep } from "../messages/complain"
import { complainTextStep } from "../messages/complain_text"
import { continueSeeFormsStep } from "../messages/continue_see_forms"
import { continueSeeLikesFormsStep } from "../messages/continue_see_likes_forms"
import { createProfileSubtypeStep } from "../messages/create_profile_subtype"
import { createProfileTypeStep } from "../messages/create_profile_type"
import { disableFormStep } from "../messages/disable_form"
import { formDisabledStep } from "../messages/form_disabled"
import { friendsStep } from "../messages/friends"
import { goMainMenuStep } from "../messages/go_main_menu"
import { moderatingReportsStep } from "../messages/moderating_reports"
import { optionsToUserStep } from "../messages/options_to_user"
import { prepareMessageStep } from "../messages/prepare_message"
import { profileStep } from "../messages/profile"
import { questionsStep } from "../messages/questions/index"
import { reviewingNewProfilesStep } from "../messages/reviewing_new_profiles"
import { rouletteSearchingStep } from "../messages/roulette_searching"
import { rouletteStartStep } from "../messages/roulette_start"
import { searchPeopleStep } from "../messages/search_people"
import { searchPeopleWithLikesStep } from "../messages/search_people_with_likes"
import { sleepMenuStep } from "../messages/sleep_menu"
import { somebodysLikedYouStep } from "../messages/somebodys_liked_you"
import { startUsingBotStep } from "../messages/start_using_bot"
import { switchProfileStep } from "../messages/switch_profile"
import { textOrVideoToUserStep } from "../messages/text_or_video_to_user"
import { waitingForBanReasonProfileStep } from "../messages/waiting_for_ban_reason_profile"
import { waitingForBanReasonReportStep } from "../messages/waiting_for_ban_reason_report"
import { youAlreadyHaveThisProfileStep } from "../messages/you_already_have_this_profile"
import { youDontHaveFormStep } from "../messages/you_dont_have_form"
import { MyContext } from "../typescript/context"

export async function messageEvent(ctx: MyContext) {
    ctx.logger.info({ 
        userId: ctx.from?.id,
        username: ctx.from?.username,
        step: ctx.session.step,
        messageType: ctx.message?.text ? 'text' : ctx.message?.photo ? 'photo' : 'other'
    }, 'Processing message event');

    if (ctx.session.step === "choose_language_start") {
        await chooseLanguageStartStep(ctx)
    } else if (ctx.session.step === "choose_language") {
        await chooseLanguageStep(ctx)
    } else if (ctx.session.step === "prepare_message") {
        await prepareMessageStep(ctx)
    } else if (ctx.session.step === "accept_privacy") {
        await acceptPrivacyStep(ctx)
    } else if (ctx.session.step === "questions") {
        await questionsStep(ctx)
    } else if (ctx.session.step === 'profile') {
        await profileStep(ctx)
    } else if (ctx.session.step === 'sleep_menu') {
        await sleepMenuStep(ctx)
    } else if (ctx.session.step === 'friends') {
        await friendsStep(ctx)
    } else if (ctx.session.step === 'disable_form') {
        await disableFormStep(ctx)
    } else if (ctx.session.step === 'form_disabled') {
        await formDisabledStep(ctx)
    } else if (ctx.session.step === 'you_dont_have_form') {
        await youDontHaveFormStep(ctx)
    } else if (ctx.session.step === 'cannot_send_complain') {
        await cannotSendComplainStep(ctx)
    } else if (ctx.session.step === 'search_people') {
        await searchPeopleStep(ctx)
    } else if (ctx.session.step === 'search_people_with_likes') {
        await searchPeopleWithLikesStep(ctx)
    } else if (ctx.session.step === 'continue_see_forms') {
        await continueSeeFormsStep(ctx)
    } else if (ctx.session.step === 'continue_see_likes_forms') {
        await continueSeeLikesFormsStep(ctx)
    } else if (ctx.session.step === 'text_or_video_to_user') {
        await textOrVideoToUserStep(ctx)
    } else if (ctx.session.step === 'add_private_note') {
        await addPrivateNoteStep(ctx)
    } else if (ctx.session.step === 'added_private_note') {
        await textOrVideoToUserStep(ctx)
    } else if (ctx.session.step === 'somebodys_liked_you') {
        await somebodysLikedYouStep(ctx)
    } else if (ctx.session.step === 'complain') {
        await complainStep(ctx)
    } else if (ctx.session.step === 'complain_text') {
        await complainTextStep(ctx)
    } else if (ctx.session.step === 'roulette_searching') {
        await rouletteSearchingStep(ctx)
    } else if (ctx.session.step === 'roulette_start') {
        await rouletteStartStep(ctx)
    } else if (ctx.session.step === 'options_to_user') {
        await optionsToUserStep(ctx)
    } else if (ctx.session.step === 'blacklist_user') {
        await blacklistUserStep(ctx)
    } else if (ctx.session.step === 'go_main_menu') {
        await goMainMenuStep(ctx)
    } else if (ctx.session.step === 'start_using_bot') {
        await startUsingBotStep(ctx)
    } else if (ctx.session.step === 'create_profile_type') {
        await createProfileTypeStep(ctx)
    } else if (ctx.session.step === 'create_profile_subtype') {
        await createProfileSubtypeStep(ctx)
    } else if (ctx.session.step === 'switch_profile') {
        await switchProfileStep(ctx)
    } else if (ctx.session.step === 'you_already_have_this_profile') {
        await youAlreadyHaveThisProfileStep(ctx)
    } else if (ctx.session.step === 'moderating_reports') {
        await moderatingReportsStep(ctx)
    } else if (ctx.session.step === 'waiting_for_ban_reason_report') {
        await waitingForBanReasonReportStep(ctx)
    } else if (ctx.session.step === 'waiting_for_ban_reason_profile') {
        await waitingForBanReasonProfileStep(ctx)
    } else if (ctx.session.step === 'reviewing_new_profiles') {
        await reviewingNewProfilesStep(ctx)
    } else {
        ctx.logger.warn({ 
            userId: ctx.from?.id,
            step: ctx.session.step 
        }, 'Unknown step encountered');
        await ctx.reply(ctx.t('no_such_answer'));
    }
}
