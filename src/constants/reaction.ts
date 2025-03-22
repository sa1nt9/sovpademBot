import { ReactionType } from "@prisma/client";

export interface Reaction {
    type: ReactionType;
    emoji: string;
}

export const REACTIONS: Reaction[] = [
    { type: "LIKE", emoji: "👍" },
    { type: "DISLIKE", emoji: "👎" },
    { type: "CLOWN", emoji: "🤡" },
    { type: "FUNNY", emoji: "😂" },
    { type: "BORING", emoji: "😴" },
    { type: "RUDE", emoji: "😡" }
];

// Функция для получения эмодзи по типу реакции
export const getReactionEmoji = (reactionType: ReactionType): string => {
    const reaction = REACTIONS.find(r => r.type === reactionType);
    return reaction ? reaction.emoji : "";
}; 