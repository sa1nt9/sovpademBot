import { MyContext } from "../main";
import { User } from "@prisma/client";
import { IFile } from "../typescript/interfaces/IFile";

export const buildTextForm = (form: User) => {
    return `${form.name}, ${form.age}, ${form.city}${form.text ? `, ${form.text}` : ''}`
}

export const sendForm = async (ctx: MyContext, form: User | null, options?: { notSendThisIs: boolean }) => {
    if (!options?.notSendThisIs) {
        await ctx.reply(ctx.t('this_is_your_form'));
    }
    if (form?.files) {
        const files: IFile[] = form?.files ? JSON.parse(form?.files as any) : []

        await ctx.replyWithMediaGroup(files?.map((i, index) => (index === 0 ? { ...i, caption: buildTextForm(form) } : i)));
    }
}