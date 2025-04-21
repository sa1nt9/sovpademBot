import { ProfileType } from "@prisma/client";
import { TProfileSubType } from "./IProfile";

export interface ILikeNotificationData {
    targetUserId: string;
    fromUserId: string;
    targetProfileId: string;
    fromProfileId: string;
    isAnswer?: boolean;
    notificationId: string;
    profileType: ProfileType;
    subType: TProfileSubType | ""
}
