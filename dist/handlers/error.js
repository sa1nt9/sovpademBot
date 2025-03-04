"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error) => {
    const { ctx } = error;
    ctx.logger.error({
        err: error.error,
        update: getUpdateInfo(ctx),
    });
};
exports.errorHandler = errorHandler;
