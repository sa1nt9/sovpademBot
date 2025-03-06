import { User } from "@prisma/client";
import { IFile } from "../typescript/interfaces/IFile";
import { MyContext } from "../typescript/context";
import { answerFormKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { toggleUserActive } from "./db/toggleUserActive";

export const buildTextForm = (form: User) => {
    return `${form.name}, ${form.age}, ${form.city}${form.text ? `, ${form.text}` : ''}`
}

interface IOptions {
    myForm: boolean
}

const defaultOptions = {
    myForm: true
}

export const sendForm = async (ctx: MyContext, form?: User | null, options: IOptions = defaultOptions) => {
    let user: User | null | undefined = form


    if (options?.myForm) {
        await ctx.reply(ctx.t('this_is_your_form'));
        user = await prisma.user.findUnique({
            where: { id: String(ctx.message?.from.id) },
        });
    }
    if (!user) return;
    
    if (!user.isActive && options?.myForm) {
        await toggleUserActive(ctx, true)
    }

    const text = buildTextForm(user);
    
    if (user?.files) {
        const files: IFile[] = JSON.parse(user.files as any);

        await ctx.replyWithMediaGroup(files.map((i, index) => ({
            ...i,
            caption: index === 0 ? text : ''
        })));
    }
}