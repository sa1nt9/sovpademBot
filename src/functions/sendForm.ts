import { ProfileLike, User } from "@prisma/client";
import { IFile } from "../typescript/interfaces/IFile";
import { MyContext } from "../typescript/context";
import { getLikesCount } from "./db/getLikesInfo";
import { getMe } from "./db/getMe";
import { haversine, formatDistance } from "./haversine";
import { getGameProfileLink, getGameUsername, getGameUsernameToShow } from "./gameLink";
import { IGameProfile, IHobbyProfile, IItProfile, IProfile, IRelationshipProfile, ISportProfile, TProfileSubType } from "../typescript/interfaces/IProfile";
import { getUserProfile } from "./db/profilesService";
import { ProfileType } from "@prisma/client";
import { prisma } from "../db/postgres";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { TranslateFunction } from "@grammyjs/i18n";
import { i18n } from "../i18n";

interface IOptions {
    myForm?: boolean
    like?: ProfileLike | null
    sendTo?: string
    privateNote?: string | null
    isBlacklist?: boolean
    blacklistCount?: number
    isInline?: boolean
    description?: string
    profileType?: ProfileType
    subType?: TProfileSubType
    translate?: TranslateFunction
    specificProfileId?: string
}

const defaultOptions: IOptions = {
    myForm: true,
    like: null,
    sendTo: '',
    privateNote: '',
    isBlacklist: false,
    blacklistCount: 0,
    isInline: false,
    description: ''
}

export const buildInfoText = (ctx: MyContext, form: User, options: IOptions = defaultOptions) => {
    return `${form.name}, ${form.age}, ${(!options.isInline && ctx.session.activeProfile.ownCoordinates && form.ownCoordinates && !options.myForm) ? `📍${formatDistance(haversine(ctx.session.activeProfile.location.latitude, ctx.session.activeProfile.location.longitude, form.latitude, form.longitude), ctx.t)}` : form.city}`
}

// Функция для построения текста спортивной анкеты
const buildSportProfileText = (ctx: MyContext, profile: ISportProfile, options: IOptions = defaultOptions) => {
    return `, ${ctx.t(`sport_type_${profile.subType.toLowerCase()}`)} - ${profile.level}`;
}

// Функция для построения текста игровой анкеты
const buildGameProfileText = (ctx: MyContext, profile: IGameProfile, options: IOptions = defaultOptions) => {
    const [link, platform] = profile.accountLink ? getGameProfileLink(profile.subType, profile.accountLink) : [];
    const accountLinkText = profile.accountLink ? `\n🔗 ${ctx.t('profile_link', { platform })}: [${getGameUsernameToShow(profile.subType, profile.accountLink)}](${link})` : '';

    return `\n\n${ctx.t(`game_type_${profile.subType.toLowerCase()}`)}${accountLinkText}`;
}

// Функция для построения текста хобби-анкеты
const buildHobbyProfileText = (ctx: MyContext, profile: IHobbyProfile, options: IOptions = defaultOptions) => {
    return `, ${ctx.t(`hobby_type_${profile.subType.toLowerCase()}`)}`;
}

// Функция для построения текста IT-анкеты
const buildITProfileText = (ctx: MyContext, profile: IItProfile, options: IOptions = defaultOptions) => {
    const experienceText = ` - ${profile.experience}`
    const technologiesText = profile.technologies ? `\n🛠️ ${ctx.t('technologies')}: ${profile.technologies}` : '';
    const githubText = profile.github ? `\n🔗 ${ctx.t('github')}: [${profile.github}](https://github.com/${profile.github})` : '';

    return `\n\n${ctx.t(`it_type_${profile.subType.toLowerCase()}`)}${experienceText}${technologiesText}${githubText}`;
}

export const buildTextForm = async (ctx: MyContext, form: User, options: IOptions = defaultOptions) => {
    let count: number = 0
    if (options.like) {
        count = await getLikesCount(String(ctx.from?.id), 'user')
    }

    ctx.logger.info(options, 'Building text form');

    ctx.t = options.translate || ctx.t;

    if (options.isInline) {
        const currentSession = await prisma.session.findUnique({
            where: {
                key: form.id
            }
        });

        if (currentSession) {
            const currentValue = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

            ctx.session = currentValue
        }
    }
    // Получаем тип профиля и соответствующую информацию
    const profileType = options.profileType || ctx.session.activeProfile.profileType;
    let profileSpecificText = '';

    // Формируем текст в зависимости от типа профиля
    switch (profileType) {
        case 'SPORT':
            profileSpecificText = buildSportProfileText(ctx, ctx.session.activeProfile as ISportProfile, options);
            break;
        case 'GAME':
            profileSpecificText = buildGameProfileText(ctx, ctx.session.activeProfile as IGameProfile, options);
            break;
        case 'HOBBY':
            profileSpecificText = buildHobbyProfileText(ctx, ctx.session.activeProfile as IHobbyProfile, options);
            break;
        case 'IT':
            profileSpecificText = buildITProfileText(ctx, ctx.session.activeProfile as IItProfile, options);
            break;
        default:
            profileSpecificText = '';
    }

    return (
        (options.like ? `${ctx.t('somebody_liked_you_text', { count: count - 1 })}

` : '')
        +
        (options.isBlacklist ? `${ctx.t('blacklist_user_info', { count: options.blacklistCount ? options.blacklistCount : 0 })}

` : '')
        +
        `${ctx.t(`profile_type_${profileType.toLowerCase()}`)} - ${buildInfoText(ctx, form, options)}${profileSpecificText ? `${profileSpecificText}` : ''}${options.description ? `\n\n${options.description}` : ''}`
        +
        (options.like?.message ? `
            
${ctx.t('message_for_you')} ${options.like.message}` : '')
    )
        +
        (options.privateNote ? `
    
${ctx.t('your_text_note')} ${options.privateNote}` : '')
}

export const sendForm = async (ctx: MyContext, form?: User | null, options: IOptions = defaultOptions) => {
    const userId = String(ctx.from?.id);
    ctx.logger.info({ 
        userId,
        formId: form?.id,
        options: {
            myForm: options.myForm,
            isBlacklist: options.isBlacklist,
            isInline: options.isInline,
            profileType: options.profileType,
            subType: options.subType
        }
    }, 'Starting sendForm function');

    let user: User | null | undefined = form

    if (options?.myForm) {
        if (!options.sendTo) {
            await ctx.reply(ctx.t('this_is_your_form'));
        }
        user = await getMe(String(ctx.from?.id))
    }
    if (!user) {
        ctx.logger.warn({ userId }, 'User not found for form sending');
        return;
    }

    const getProfileFiles = async (user: User): Promise<{ files: IFile[], description: string }> => {
        try {
            // Получаем тип профиля из сессии
            const profileType = options.profileType || ctx.session.activeProfile.profileType as ProfileType;

            ctx.logger.info({ 
                userId: user.id,
                profileType,
                subType: options.subType || (ctx.session.activeProfile as any).subType,
                specificProfileId: options.specificProfileId
            }, 'Getting profile files');

            // Если указан конкретный ID профиля, получаем его
            let profile;
            if (options.specificProfileId) {
                // Получаем профиль по его ID
                const tempProfile = await (prisma as any)[`${profileType.toLowerCase()}Profile`].findUnique({
                    where: { id: options.specificProfileId }
                });

                profile = await getUserProfile(user.id, profileType, profileType !== 'RELATIONSHIP' ? (tempProfile?.subType as TProfileSubType) : undefined);
            } else {
                // Получаем профиль пользователя стандартным способом
                profile = await getUserProfile(user.id, profileType, options.subType || (ctx.session.activeProfile as any).subType);
            }

            if (!profile || !profile.files || profile.files.length === 0) {
                ctx.logger.info({ userId: user.id }, 'No files found for profile');
                return { files: [], description: profile?.description || '' };
            }
            
            ctx.logger.info({ 
                userId: user.id,
                filesCount: profile.files.length
            }, 'Profile files retrieved successfully');

            // Преобразуем файлы в формат для отправки
            return { files: profile.files, description: profile.description };
        } catch (error) {
            ctx.logger.error({
                userId: user.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 'Error getting profile files');
            return { files: [], description: '' };
        }
    }

    const { files, description } = await getProfileFiles(user);

    let text = '';

    if (options.sendTo) {
        const currentSession = await prisma.session.findUnique({
            where: {
                key: options.sendTo
            }
        });
    
        const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;
        text = await buildTextForm(ctx, user, { ...options, description: description, translate: (...args) => i18n(false).t(__language_code || "ru", ...args) });
    } else {
        text = await buildTextForm(ctx, user, { ...options, description: description });
    }

    ctx.logger.info({ 
        userId: user.id,
        hasFiles: files.length > 0,
        sendTo: options.sendTo
    }, 'Sending form');

    if (files && files.length > 0) {
        if (options.sendTo) {
            await ctx.api.sendMediaGroup(options.sendTo, files.map((i, index) => ({
                ...i,
                caption: index === 0 ? text : '',
                parse_mode: 'Markdown'
            })));
        } else {
            await ctx.replyWithMediaGroup(files.map((i, index) => ({
                ...i,
                caption: index === 0 ? text : '',
                parse_mode: 'Markdown'
            })));

            if (options.like?.videoFileId) {
                await ctx.replyWithVideo(options.like.videoFileId, {
                    caption: ctx.t('video_for_you'),
                });
            }

            if (options.like?.voiceFileId) {
                await ctx.replyWithVoice(options.like.voiceFileId, {
                    caption: ctx.t('voice_for_you'),
                });
            }

            if (options.like?.videoNoteFileId) {
                const videoNote = await ctx.replyWithVideoNote(options.like.videoNoteFileId);
                await ctx.reply(ctx.t('video_note_for_you'), {
                    reply_to_message_id: videoNote.message_id
                });
            }
        }
    } else {
        if (options.sendTo) {
            await ctx.api.sendMessage(options.sendTo, text, {
                parse_mode: 'Markdown'
            });
        } else {
            await ctx.reply(text, {
                parse_mode: 'Markdown'
            });
        }
    }

    ctx.logger.info({ userId: user.id }, 'Form sent successfully');
}