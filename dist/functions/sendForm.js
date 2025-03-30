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
exports.sendForm = exports.buildTextForm = exports.buildInfoText = void 0;
const toggleUserActive_1 = require("./db/toggleUserActive");
const getLikesInfo_1 = require("./db/getLikesInfo");
const getMe_1 = require("./db/getMe");
const haversine_1 = require("./haversine");
const defaultOptions = {
    myForm: true,
    like: null,
    sendTo: '',
    privateNote: '',
    isBlacklist: false,
    blacklistCount: 0,
    isInline: false
};
const buildInfoText = (ctx, form, options = defaultOptions) => {
    return `${form.name}, ${form.age}, ${(!options.isInline && ctx.session.activeProfile.ownCoordinates && form.ownCoordinates && !options.myForm) ? `📍${(0, haversine_1.formatDistance)((0, haversine_1.haversine)(ctx.session.activeProfile.location.latitude, ctx.session.activeProfile.location.longitude, form.latitude, form.longitude), ctx.t)}` : form.city}`;
};
exports.buildInfoText = buildInfoText;
const buildTextForm = (ctx_1, form_1, ...args_1) => __awaiter(void 0, [ctx_1, form_1, ...args_1], void 0, function* (ctx, form, options = defaultOptions) {
    var _a, _b;
    let count = 0;
    if (options.like) {
        count = yield (0, getLikesInfo_1.getLikesCount)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), options.like.fromProfileType);
    }
    const getDescription = () => {
        return 'Описание профиля';
    };
    return ((options.like ? `${ctx.t('somebody_liked_you_text', { count: count - 1 })}

` : '')
        +
            (options.isBlacklist ? `${ctx.t('blacklist_user_info', { count: options.blacklistCount ? options.blacklistCount : 0 })}

` : '')
        +
            `${(0, exports.buildInfoText)(ctx, form, options)}${getDescription() ? ` - ${getDescription()}` : ''}`
        +
            (((_b = options.like) === null || _b === void 0 ? void 0 : _b.message) ? `
            
${ctx.t('message_for_you')} ${options.like.message}` : ''))
        +
            (options.privateNote ? `
    
${ctx.t('your_text_note')} ${options.privateNote}` : '');
});
exports.buildTextForm = buildTextForm;
const sendForm = (ctx_1, form_1, ...args_1) => __awaiter(void 0, [ctx_1, form_1, ...args_1], void 0, function* (ctx, form, options = defaultOptions) {
    var _a, _b, _c, _d;
    let user = form;
    if (options === null || options === void 0 ? void 0 : options.myForm) {
        if (!options.sendTo) {
            yield ctx.reply(ctx.t('this_is_your_form'));
        }
        user = yield (0, getMe_1.getMe)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id));
    }
    if (!user)
        return;
    if (!user.isActive && (options === null || options === void 0 ? void 0 : options.myForm)) {
        yield (0, toggleUserActive_1.toggleUserActive)(ctx, true);
    }
    const text = yield (0, exports.buildTextForm)(ctx, user, options);
    const getProfileFiles = (user) => {
        return [];
    };
    const files = getProfileFiles(user);
    if (files && files.length > 0) {
        if (options.sendTo) {
            yield ctx.api.sendMediaGroup(options.sendTo, files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '' }))));
        }
        else {
            yield ctx.replyWithMediaGroup(files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '' }))));
            if ((_b = options.like) === null || _b === void 0 ? void 0 : _b.videoFileId) {
                yield ctx.replyWithVideo(options.like.videoFileId, {
                    caption: ctx.t('video_for_you')
                });
            }
            if ((_c = options.like) === null || _c === void 0 ? void 0 : _c.voiceFileId) {
                yield ctx.replyWithVoice(options.like.voiceFileId, {
                    caption: ctx.t('voice_for_you')
                });
            }
            if ((_d = options.like) === null || _d === void 0 ? void 0 : _d.videoNoteFileId) {
                const videoNote = yield ctx.replyWithVideoNote(options.like.videoNoteFileId);
                yield ctx.reply(ctx.t('video_note_for_you'), {
                    reply_to_message_id: videoNote.message_id
                });
            }
        }
    }
    else {
        if (options.sendTo) {
            yield ctx.api.sendMessage(options.sendTo, text);
        }
        else {
            yield ctx.reply(text);
        }
    }
});
exports.sendForm = sendForm;
