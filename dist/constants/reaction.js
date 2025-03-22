"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReactionEmoji = exports.REACTIONS = void 0;
exports.REACTIONS = [
    { type: "LIKE", emoji: "👍" },
    { type: "DISLIKE", emoji: "👎" },
    { type: "CLOWN", emoji: "🤡" },
    { type: "FUNNY", emoji: "😂" },
    { type: "BORING", emoji: "😴" },
    { type: "RUDE", emoji: "😡" }
];
// Функция для получения эмодзи по типу реакции
const getReactionEmoji = (reactionType) => {
    const reaction = exports.REACTIONS.find(r => r.type === reactionType);
    return reaction ? reaction.emoji : "";
};
exports.getReactionEmoji = getReactionEmoji;
