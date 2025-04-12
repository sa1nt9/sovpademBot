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
const postgres_1 = require("../db/postgres");
const i18n_1 = require("../i18n");
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
    ctx.t = options.translate || ctx.t;
    if (options.isInline) {
        const currentSession = yield postgres_1.prisma.session.findUnique({
            where: {
                key: form.id
            }
        });
        if (currentSession) {
            const currentValue = currentSession ? JSON.parse(currentSession.value) : {};
            ctx.session = currentValue;
        }
    }
    // Получаем тип профиля и соответствующую информацию
    const profileType = options.profileType || ctx.session.activeProfile.profileType;
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
            `${ctx.t(`profile_type_${profileType.toLowerCase()}`)} - ${(0, exports.buildInfoText)(ctx, form, options)}${profileSpecificText ? `${profileSpecificText}` : ''}${options.description ? `\n\n${options.description}` : ''}`
        +
            (((_b = options.like) === null || _b === void 0 ? void 0 : _b.message) ? `
            
${ctx.t('message_for_you')} ${options.like.message}` : ''))
        +
            (options.privateNote ? `
    
${ctx.t('your_text_note')} ${options.privateNote}` : '');
});
exports.buildTextForm = buildTextForm;
const sendForm = (ctx_1, form_1, ...args_1) => __awaiter(void 0, [ctx_1, form_1, ...args_1], void 0, function* (ctx, form, options = defaultOptions) {
    var _a, _b, _c, _d, _e;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    ctx.logger.info({
        userId,
        formId: form === null || form === void 0 ? void 0 : form.id,
        options: {
            myForm: options.myForm,
            isBlacklist: options.isBlacklist,
            isInline: options.isInline,
            profileType: options.profileType,
            subType: options.subType
        }
    }, 'Starting sendForm function');
    let user = form;
    if (options === null || options === void 0 ? void 0 : options.myForm) {
        if (!options.sendTo) {
            yield ctx.reply(ctx.t('this_is_your_form'));
        }
        user = yield (0, getMe_1.getMe)(String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id));
    }
    if (!user) {
        ctx.logger.warn({ userId }, 'User not found for form sending');
        return;
    }
    const getProfileFiles = (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Получаем тип профиля из сессии
            const profileType = options.profileType || ctx.session.activeProfile.profileType;
            ctx.logger.info({
                userId: user.id,
                profileType,
                subType: options.subType || ctx.session.activeProfile.subType
            }, 'Getting profile files');
            // Получаем профиль пользователя
            const profile = yield (0, profilesService_1.getUserProfile)(user.id, profileType, options.subType || ctx.session.activeProfile.subType);
            if (!profile || !profile.files || profile.files.length === 0) {
                ctx.logger.info({ userId: user.id }, 'No files found for profile');
                return { files: [], description: (profile === null || profile === void 0 ? void 0 : profile.description) || '' };
            }
            ctx.logger.info({
                userId: user.id,
                filesCount: profile.files.length
            }, 'Profile files retrieved successfully');
            // Преобразуем файлы в формат для отправки
            return { files: profile.files, description: profile.description };
        }
        catch (error) {
            ctx.logger.error({
                userId: user.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 'Error getting profile files');
            return { files: [], description: '' };
        }
    });
    const { files, description } = yield getProfileFiles(user);
    let text = '';
    if (options.sendTo) {
        const currentSession = yield postgres_1.prisma.session.findUnique({
            where: {
                key: options.sendTo
            }
        });
        const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
        text = yield (0, exports.buildTextForm)(ctx, user, Object.assign(Object.assign({}, options), { description: description, translate: (...args) => (0, i18n_1.i18n)(false).t(__language_code || "ru", ...args) }));
    }
    else {
        text = yield (0, exports.buildTextForm)(ctx, user, Object.assign(Object.assign({}, options), { description: description }));
    }
    ctx.logger.info({
        userId: user.id,
        hasFiles: files.length > 0,
        sendTo: options.sendTo
    }, 'Sending form');
    if (files && files.length > 0) {
        if (options.sendTo) {
            yield ctx.api.sendMediaGroup(options.sendTo, files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '', parse_mode: 'Markdown' }))));
        }
        else {
            yield ctx.replyWithMediaGroup(files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '', parse_mode: 'Markdown' }))));
            if ((_c = options.like) === null || _c === void 0 ? void 0 : _c.videoFileId) {
                yield ctx.replyWithVideo(options.like.videoFileId, {
                    caption: ctx.t('video_for_you'),
                });
            }
            if ((_d = options.like) === null || _d === void 0 ? void 0 : _d.voiceFileId) {
                yield ctx.replyWithVoice(options.like.voiceFileId, {
                    caption: ctx.t('voice_for_you'),
                });
            }
            if ((_e = options.like) === null || _e === void 0 ? void 0 : _e.videoNoteFileId) {
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
    ctx.logger.info({ userId: user.id }, 'Form sent successfully');
});
exports.sendForm = sendForm;
