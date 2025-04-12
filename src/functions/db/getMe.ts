import { prisma } from "../../db/postgres";
import { logger } from "../../logger";

export async function getMe(id: string) {
    logger.info({ userId: id }, 'Getting user profile');
    const user = await prisma.user.findUnique({
        where: { id: id },
    });
    
    if (user) {
        logger.info({ userId: id }, 'User profile found');
    } else {
        logger.warn({ userId: id }, 'User profile not found');
    }
    
    return user;
}
