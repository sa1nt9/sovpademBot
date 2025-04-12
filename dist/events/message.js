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
exports.messageEvent = messageEvent;
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
const create_profile_subtype_1 = require("../messages/create_profile_subtype");
const create_profile_type_1 = require("../messages/create_profile_type");
const disable_form_1 = require("../messages/disable_form");
const form_disabled_1 = require("../messages/form_disabled");
const friends_1 = require("../messages/friends");
const go_main_menu_1 = require("../messages/go_main_menu");
const options_to_user_1 = require("../messages/options_to_user");
const prepare_message_1 = require("../messages/prepare_message");
const profile_1 = require("../messages/profile");
const index_1 = require("../messages/questions/index");
const roulette_searching_1 = require("../messages/roulette_searching");
const roulette_start_1 = require("../messages/roulette_start");
const search_people_1 = require("../messages/search_people");
const search_people_with_likes_1 = require("../messages/search_people_with_likes");
const sleep_menu_1 = require("../messages/sleep_menu");
const somebodys_liked_you_1 = require("../messages/somebodys_liked_you");
const start_using_bot_1 = require("../messages/start_using_bot");
const switch_profile_1 = require("../messages/switch_profile");
const text_or_video_to_user_1 = require("../messages/text_or_video_to_user");
const you_already_have_this_profile_1 = require("../messages/you_already_have_this_profile");
const you_dont_have_form_1 = require("../messages/you_dont_have_form");
function messageEvent(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        ctx.logger.info({
            userId: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id,
            username: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username,
            step: ctx.session.step,
            messageType: ((_c = ctx.message) === null || _c === void 0 ? void 0 : _c.text) ? 'text' : ((_d = ctx.message) === null || _d === void 0 ? void 0 : _d.photo) ? 'photo' : 'other'
        }, 'Processing message event');
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
            yield (0, index_1.questionsStep)(ctx);
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
        else if (ctx.session.step === 'go_main_menu') {
            yield (0, go_main_menu_1.goMainMenuStep)(ctx);
        }
        else if (ctx.session.step === 'start_using_bot') {
            yield (0, start_using_bot_1.startUsingBotStep)(ctx);
        }
        else if (ctx.session.step === 'create_profile_type') {
            yield (0, create_profile_type_1.createProfileTypeStep)(ctx);
        }
        else if (ctx.session.step === 'create_profile_subtype') {
            yield (0, create_profile_subtype_1.createProfileSubtypeStep)(ctx);
        }
        else if (ctx.session.step === 'switch_profile') {
            yield (0, switch_profile_1.switchProfileStep)(ctx);
        }
        else if (ctx.session.step === 'you_already_have_this_profile') {
            yield (0, you_already_have_this_profile_1.youAlreadyHaveThisProfileStep)(ctx);
        }
        else {
            ctx.logger.warn({
                userId: (_e = ctx.from) === null || _e === void 0 ? void 0 : _e.id,
                step: ctx.session.step
            }, 'Unknown step encountered');
            yield ctx.reply(ctx.t('no_such_answer'));
        }
    });
}
