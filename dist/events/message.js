"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageEvent = void 0;
const accept_privacy_1 = require("../messages/accept_privacy");
const add_private_note_1 = require("../messages/add_private_note");
const blacklist_user_1 = require("../messages/blacklist_user");
const cannot_send_complain_1 = require("../messages/cannot_send_complain");
const choose_language_1 = require("../messages/choose_language");
const choose_language_start_1 = require("../messages/choose_language_start");
const complain_1 = require("../messages/complain");
const complain_text_1 = require("../messages/complain_text");
const continue_see_forms_1 = require("../messages/continue_see_forms");
const continue_see_likes_forms_1 = require("../messages/continue_see_likes_forms");
const disable_form_1 = require("../messages/disable_form");
const form_disabled_1 = require("../messages/form_disabled");
const friends_1 = require("../messages/friends");
const options_to_user_1 = require("../messages/options_to_user");
const prepare_message_1 = require("../messages/prepare_message");
const profile_1 = require("../messages/profile");
const questions_1 = require("../messages/questions");
const roulette_searching_1 = require("../messages/roulette_searching");
const roulette_start_1 = require("../messages/roulette_start");
const search_people_1 = require("../messages/search_people");
const search_people_with_likes_1 = require("../messages/search_people_with_likes");
const sleep_menu_1 = require("../messages/sleep_menu");
const somebodys_liked_you_1 = require("../messages/somebodys_liked_you");
const text_or_video_to_user_1 = require("../messages/text_or_video_to_user");
const you_dont_have_form_1 = require("../messages/you_dont_have_form");
const messageEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.step === "choose_language_start") {
        yield (0, choose_language_start_1.chooseLanguageStartStep)(ctx);
    }
    else if (ctx.session.step === "choose_language") {
        yield (0, choose_language_1.chooseLanguageStep)(ctx);
    }
    else if (ctx.session.step === "prepare_message") {
        yield (0, prepare_message_1.prepareMessageStep)(ctx);
    }
    else if (ctx.session.step === "accept_privacy") {
        yield (0, accept_privacy_1.acceptPrivacyStep)(ctx);
    }
    else if (ctx.session.step === "questions") {
        yield (0, questions_1.questionsStep)(ctx);
    }
    else if (ctx.session.step === 'profile') {
        yield (0, profile_1.profileStep)(ctx);
    }
    else if (ctx.session.step === 'sleep_menu') {
        yield (0, sleep_menu_1.sleepMenuStep)(ctx);
    }
    else if (ctx.session.step === 'friends') {
        yield (0, friends_1.friendsStep)(ctx);
    }
    else if (ctx.session.step === 'disable_form') {
        yield (0, disable_form_1.disableFormStep)(ctx);
    }
    else if (ctx.session.step === 'form_disabled') {
        yield (0, form_disabled_1.formDisabledStep)(ctx);
    }
    else if (ctx.session.step === 'you_dont_have_form') {
        yield (0, you_dont_have_form_1.youDontHaveFormStep)(ctx);
    }
    else if (ctx.session.step === 'cannot_send_complain') {
        yield (0, cannot_send_complain_1.cannotSendComplainStep)(ctx);
    }
    else if (ctx.session.step === 'search_people') {
        yield (0, search_people_1.searchPeopleStep)(ctx);
    }
    else if (ctx.session.step === 'search_people_with_likes') {
        yield (0, search_people_with_likes_1.searchPeopleWithLikesStep)(ctx);
    }
    else if (ctx.session.step === 'continue_see_forms') {
        yield (0, continue_see_forms_1.continueSeeFormsStep)(ctx);
    }
    else if (ctx.session.step === 'continue_see_likes_forms') {
        yield (0, continue_see_likes_forms_1.continueSeeLikesFormsStep)(ctx);
    }
    else if (ctx.session.step === 'text_or_video_to_user') {
        yield (0, text_or_video_to_user_1.textOrVideoToUserStep)(ctx);
    }
    else if (ctx.session.step === 'add_private_note') {
        yield (0, add_private_note_1.addPrivateNoteStep)(ctx);
    }
    else if (ctx.session.step === 'added_private_note') {
        yield (0, text_or_video_to_user_1.textOrVideoToUserStep)(ctx);
    }
    else if (ctx.session.step === 'somebodys_liked_you') {
        yield (0, somebodys_liked_you_1.somebodysLikedYouStep)(ctx);
    }
    else if (ctx.session.step === 'complain') {
        yield (0, complain_1.complainStep)(ctx);
    }
    else if (ctx.session.step === 'complain_text') {
        yield (0, complain_text_1.complainTextStep)(ctx);
    }
    else if (ctx.session.step === 'roulette_searching') {
        yield (0, roulette_searching_1.rouletteSearchingStep)(ctx);
    }
    else if (ctx.session.step === 'roulette_start') {
        yield (0, roulette_start_1.rouletteStartStep)(ctx);
    }
    else if (ctx.session.step === 'options_to_user') {
        yield (0, options_to_user_1.optionsToUserStep)(ctx);
    }
    else if (ctx.session.step === 'blacklist_user') {
        yield (0, blacklist_user_1.blacklistUserStep)(ctx);
    }
    else {
        yield ctx.reply(ctx.t('no_such_answer'));
    }
});
exports.messageEvent = messageEvent;
