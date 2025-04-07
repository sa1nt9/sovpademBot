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
const getLikesInfo_1 = require("./db/getLikesInfo");
const getMe_1 = require("./db/getMe");
const haversine_1 = require("./haversine");
const gameLink_1 = require("./gameLink");
const profilesService_1 = require("./db/profilesService");
const defaultOptions = {
    myForm: true,
    like: null,
    sendTo: '',
    privateNote: '',
    isBlacklist: false,
    blacklistCount: 0,
    isInline: false,
    description: ''
};
const buildInfoText = (ctx, form, options = defaultOptions) => {
    return `${form.name}, ${form.age}, ${(!options.isInline && ctx.session.activeProfile.ownCoordinates && form.ownCoordinates && !options.myForm) ? `📍${(0, haversine_1.formatDistance)((0, haversine_1.haversine)(ctx.session.activeProfile.location.latitude, ctx.session.activeProfile.location.longitude, form.latitude, form.longitude), ctx.t)}` : form.city}`;
};
exports.buildInfoText = buildInfoText;
// Функция для построения текста спортивной анкеты
const buildSportProfileText = (ctx, profile, options = defaultOptions) => {
    return `, ${ctx.t(`sport_type_${profile.subType.toLowerCase()}`)} - ${profile.level}`;
};
// Функция для построения текста игровой анкеты
const buildGameProfileText = (ctx, profile, options = defaultOptions) => {
    const [link, platform] = profile.accountLink ? (0, gameLink_1.getGameProfileLink)(profile.subType, profile.accountLink) : [];
    const accountLinkText = profile.accountLink ? `\n🔗 ${ctx.t('profile_link', { platform })}: [${(0, gameLink_1.getGameUsernameToShow)(profile.subType, profile.accountLink)}](${link})` : '';
    return `\n\n${ctx.t(`game_type_${profile.subType.toLowerCase()}`)}${accountLinkText}`;
};
// Функция для построения текста хобби-анкеты
const buildHobbyProfileText = (ctx, profile, options = defaultOptions) => {
    return `, ${ctx.t(`hobby_type_${profile.subType.toLowerCase()}`)}`;
};
// Функция для построения текста IT-анкеты
const buildITProfileText = (ctx, profile, options = defaultOptions) => {
    const experienceText = ` - ${profile.experience}`;
    const technologiesText = profile.technologies ? `\n🛠️ ${ctx.t('technologies')}: ${profile.technologies}` : '';
    const githubText = profile.github ? `\n🔗 ${ctx.t('github')}: [${profile.github}](https://github.com/${profile.github})` : '';
    return `\n\n${ctx.t(`it_type_${profile.subType.toLowerCase()}`)}${experienceText}${technologiesText}${githubText}`;
};
const buildTextForm = (ctx_1, form_1, ...args_1) => __awaiter(void 0, [ctx_1, form_1, ...args_1], void 0, function* (ctx, form, options = defaultOptions) {
    var _a, _b;
    let count = 0;
    if (options.like) {
        count = yield (0, getLikesInfo_1.getLikesCount)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), 'user');
    }
    // Получаем тип профиля и соответствующую информацию
    const profileType = ctx.session.activeProfile.profileType;
    let profileSpecificText = '';
    // Формируем текст в зависимости от типа профиля
    switch (profileType) {
        case 'SPORT':
            profileSpecificText = buildSportProfileText(ctx, ctx.session.activeProfile, options);
            break;
        case 'GAME':
            profileSpecificText = buildGameProfileText(ctx, ctx.session.activeProfile, options);
            break;
        case 'HOBBY':
            profileSpecificText = buildHobbyProfileText(ctx, ctx.session.activeProfile, options);
            break;
        case 'IT':
            profileSpecificText = buildITProfileText(ctx, ctx.session.activeProfile, options);
            break;
        default:
            profileSpecificText = '';
    }
    return ((options.like ? `${ctx.t('somebody_liked_you_text', { count: count - 1 })}

` : '')
        +
            (options.isBlacklist ? `${ctx.t('blacklist_user_info', { count: options.blacklistCount ? options.blacklistCount : 0 })}

` : '')
        +
            `${ctx.t(`profile_type_${profileType.toLowerCase()}`)}, ${(0, exports.buildInfoText)(ctx, form, options)}${profileSpecificText ? `${profileSpecificText}` : ''}${options.description ? `\n\n${options.description}` : ''}`
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
    const getProfileFiles = (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Получаем тип профиля из сессии
            const profileType = ctx.session.activeProfile.profileType;
            // Получаем профиль пользователя
            const profile = yield (0, profilesService_1.getUserProfile)(user.id, profileType, ctx.session.activeProfile.subType);
            if (!profile || !profile.files || profile.files.length === 0) {
                return { files: [], description: '' };
            }
            // Преобразуем файлы в формат для отправки
            return { files: profile.files, description: profile.description };
        }
        catch (error) {
            ctx.logger.error({
                msg: 'Ошибка при получении файлов профиля',
                error: error
            });
            return { files: [], description: '' };
        }
    });
    const { files, description } = yield getProfileFiles(user);
    const text = yield (0, exports.buildTextForm)(ctx, user, Object.assign(Object.assign({}, options), { description: description }));
    if (files && files.length > 0) {
        if (options.sendTo) {
            yield ctx.api.sendMediaGroup(options.sendTo, files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '', parse_mode: 'Markdown' }))));
        }
        else {
            yield ctx.replyWithMediaGroup(files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '', parse_mode: 'Markdown' }))));
            if ((_b = options.like) === null || _b === void 0 ? void 0 : _b.videoFileId) {
                yield ctx.replyWithVideo(options.like.videoFileId, {
                    caption: ctx.t('video_for_you'),
                });
            }
            if ((_c = options.like) === null || _c === void 0 ? void 0 : _c.voiceFileId) {
                yield ctx.replyWithVoice(options.like.voiceFileId, {
                    caption: ctx.t('voice_for_you'),
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
            yield ctx.api.sendMessage(options.sendTo, text, {
                parse_mode: 'Markdown'
            });
        }
        else {
            yield ctx.reply(text, {
                parse_mode: 'Markdown'
            });
        }
    }
});
exports.sendForm = sendForm;
