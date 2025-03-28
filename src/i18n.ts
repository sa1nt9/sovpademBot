import { I18n } from "@grammyjs/i18n";
import { MyContext } from "./typescript/context";

export const i18n = (isInlineQuery: boolean = false) => {
    return new I18n<MyContext>({
        defaultLocale: "ru",
        directory: "locales",
        useSession: !isInlineQuery,
    });
}