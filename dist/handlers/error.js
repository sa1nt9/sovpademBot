"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { ctx } = error;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    const username = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username;
    const errorInfo = error.error instanceof Error ? {
        name: error.error.name,
        message: error.error.message,
        stack: error.error.stack,
    } : {
        name: 'Unknown Error',
        message: String(error.error),
        stack: undefined,
    };
    const updateType = ctx.update.message ? 'message' :
        ctx.update.callback_query ? 'callback_query' :
            ctx.update.inline_query ? 'inline_query' :
                'unknown';
    ctx.logger.error({
        error: errorInfo,
        update: {
            update_id: ctx.update.update_id,
            update_type: updateType,
            chat_id: (_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.id,
            message_id: (_d = ctx.message) === null || _d === void 0 ? void 0 : _d.message_id,
            callback_query_id: (_e = ctx.callbackQuery) === null || _e === void 0 ? void 0 : _e.id,
            inline_query_id: (_f = ctx.inlineQuery) === null || _f === void 0 ? void 0 : _f.id,
        },
        user: {
            id: userId,
            username,
            language_code: (_g = ctx.from) === null || _g === void 0 ? void 0 : _g.language_code,
        },
        session: {
            step: (_h = ctx.session) === null || _h === void 0 ? void 0 : _h.step,
            activeProfile: (_k = (_j = ctx.session) === null || _j === void 0 ? void 0 : _j.activeProfile) === null || _k === void 0 ? void 0 : _k.id,
        },
    }, 'Error occurred during update processing');
};
exports.errorHandler = errorHandler;
