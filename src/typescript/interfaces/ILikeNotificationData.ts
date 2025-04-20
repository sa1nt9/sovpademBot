import { ProfileType } from "@prisma/client";

export interface ILikeNotificationData {
    targetUserId: string;
    fromUserId: string;
    targetProfileId: string;
    fromProfileId: string;
    isAnswer?: boolean;
    notificationId: string;
    profileType: ProfileType;
}
