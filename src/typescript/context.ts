import { Context, SessionFlavor } from "grammy";
import { Logger } from "../logger";
import { ISessionData } from "./interfaces/ISessionData";
import { I18nFlavor } from "@grammyjs/i18n";

interface LoggerFravor {
    logger: Logger
}

export type MyContext =
    Context
    & SessionFlavor<ISessionData>
    & I18nFlavor
    & LoggerFravor;