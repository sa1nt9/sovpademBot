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
exports.sendForm = exports.buildTextForm = void 0;
const postgres_1 = require("../db/postgres");
const toggleUserActive_1 = require("./db/toggleUserActive");
const buildTextForm = (form) => {
    return `${form.name}, ${form.age}, ${form.city}${form.text ? `, ${form.text}` : ''}`;
};
exports.buildTextForm = buildTextForm;
const defaultOptions = {
    myForm: true
};
const sendForm = (ctx_1, form_1, ...args_1) => __awaiter(void 0, [ctx_1, form_1, ...args_1], void 0, function* (ctx, form, options = defaultOptions) {
    var _a;
    let user = form;
    if (options === null || options === void 0 ? void 0 : options.myForm) {
        yield ctx.reply(ctx.t('this_is_your_form'));
        user = yield postgres_1.prisma.user.findUnique({
            where: { id: String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id) },
        });
    }
    if (!user)
        return;
    if (!user.isActive && (options === null || options === void 0 ? void 0 : options.myForm)) {
        yield (0, toggleUserActive_1.toggleUserActive)(ctx, true);
    }
    const text = (0, exports.buildTextForm)(user);
    if (user === null || user === void 0 ? void 0 : user.files) {
        const files = JSON.parse(user.files);
        yield ctx.replyWithMediaGroup(files.map((i, index) => (Object.assign(Object.assign({}, i), { caption: index === 0 ? text : '' }))));
    }
});
exports.sendForm = sendForm;
