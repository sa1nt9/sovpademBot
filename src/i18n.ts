import { I18n } from "@grammyjs/i18n";
import { MyContext } from "./main";

export const i18n = new I18n<MyContext>({
    defaultLocale: "ru",
    directory: "locales",
    useSession: true,
});