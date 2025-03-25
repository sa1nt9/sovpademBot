import { User, UserLike } from "@prisma/client";
import { IFile } from "../typescript/interfaces/IFile";
import { MyContext } from "../typescript/context";
import { answerFormKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { toggleUserActive } from "./db/toggleUserActive";
import { TranslateFunction } from "@grammyjs/i18n";
import { getLikesCount, getLikesInfo } from "./db/getLikesInfo";
import { bot } from "../main";
import { getMe } from "./db/getMe";
import { haversine, formatDistance } from "./haversine";


interface IOptions {
    myForm?: boolean
    like?: UserLike | null
    sendTo?: string
    privateNote?: string | null
    isBlacklist?: boolean
    blacklistCount?: number
}

const defaultOptions: IOptions = {
    myForm: true,
    like: null,
    sendTo: '',
    privateNote: '',
    isBlacklist: false,
    blacklistCount: 0
}

export const buildInfoText = (ctx: MyContext, form: User, options: IOptions = defaultOptions) => {
    return `${form.name}, ${form.age}, ${(ctx.session.form.ownCoordinates && form.ownCoordinates && !options.myForm) ? `📍${formatDistance(haversine(ctx.session.form.location.latitude, ctx.session.form.location.longitude, form.latitude, form.longitude), ctx.t)}` : form.city}`
}


export const buildTextForm = async (ctx: MyContext, form: User, options: IOptions = defaultOptions) => {
    let count: number = 0
    if (options.like) {
        count = await getLikesCount(String(ctx.from?.id))
    }

    return (
        (options.like ? `${ctx.t('somebody_liked_you_text', { count: count - 1 })}

` : '')
        +
        (options.isBlacklist ? `${ctx.t('blacklist_user_info', { count: options.blacklistCount ? options.blacklistCount : 0 })}

` : '')
        +
        `${buildInfoText(ctx, form, options)}${form.text ? ` - ${form.text}` : ''}`
        +
        (options.like?.message ? `
            
${ctx.t('message_for_you')} ${options.like.message}` : '')
    )
        +
        (options.privateNote ? `
    
${ctx.t('your_text_note')} ${options.privateNote}` : '')
}

export const sendForm = async (ctx: MyContext, form?: User | null, options: IOptions = defaultOptions) => {
    let user: User | null | undefined = form

    if (options?.myForm) {
        if (!options.sendTo) {
            await ctx.reply(ctx.t('this_is_your_form'));
        }
        user = await getMe(String(ctx.from?.id))
    }
    if (!user) return;

    if (!user.isActive && options?.myForm) {
        await toggleUserActive(ctx, true)
    }

    const text = await buildTextForm(ctx, user, options);

    if (user?.files) {
        const files: IFile[] = JSON.parse(user.files as any);

        if (options.sendTo) {
            await ctx.api.sendMediaGroup(options.sendTo, files.map((i, index) => ({
                ...i,
                caption: index === 0 ? text : ''
            })));
        } else {
            await ctx.replyWithMediaGroup(files.map((i, index) => ({
                ...i,
                caption: index === 0 ? text : ''
            })));

            if (options.like?.videoFileId) {
                await ctx.replyWithVideo(options.like.videoFileId, {
                    caption: ctx.t('video_for_you')
                });
            }

            if (options.like?.voiceFileId) {
                await ctx.replyWithVoice(options.like.voiceFileId, {
                    caption: ctx.t('voice_for_you')
                });
            }

            if (options.like?.videoNoteFileId) {
                const videoNote = await ctx.replyWithVideoNote(options.like.videoNoteFileId);
                await ctx.reply(ctx.t('video_note_for_you'), {
                    reply_to_message_id: videoNote.message_id
                });
            }
        }
    }
}