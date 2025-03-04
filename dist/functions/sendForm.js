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
const buildTextForm = (form) => {
    return `${form.name}, ${form.age}, ${form.city}${form.text ? `, ${form.text}` : ''}`;
};
exports.buildTextForm = buildTextForm;
const sendForm = (ctx, form, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(options === null || options === void 0 ? void 0 : options.notSendThisIs)) {
        yield ctx.reply(ctx.t('this_is_your_form'));
    }
    if (form === null || form === void 0 ? void 0 : form.files) {
        const files = (form === null || form === void 0 ? void 0 : form.files) ? JSON.parse(form === null || form === void 0 ? void 0 : form.files) : [];
        yield ctx.replyWithMediaGroup(files === null || files === void 0 ? void 0 : files.map((i, index) => (index === 0 ? Object.assign(Object.assign({}, i), { caption: (0, exports.buildTextForm)(form) }) : i)));
    }
});
exports.sendForm = sendForm;
