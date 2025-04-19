import { prisma } from "../../db/postgres";
import { ProfileType } from "@prisma/client";

/**
 * Получает следующую новую анкету для проверки
 * Возвращает анкету любого типа (отношения, спорт, хобби и т.д.)
 */
export async function getNextNewProfile() {
    // Получаем дату, созданные за последние 7 дней
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Пробуем найти любую активную анкету из всех типов
    // Сначала ищем анкету для отношений
    const relationshipProfile = await prisma.relationshipProfile.findFirst({
        where: {
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
            isReviewed: false,
        },
        orderBy: { createdAt: 'asc' }
    });
    
    if (relationshipProfile) {
        return {
            ...relationshipProfile,
            profileType: ProfileType.RELATIONSHIP
        };
    }
    
    // Если не нашли анкету отношений, ищем спортивную анкету
    const sportProfile = await prisma.sportProfile.findFirst({
        where: {
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
            isReviewed: false,
        },
        orderBy: { createdAt: 'asc' }
    });
    
    if (sportProfile) {
        return {
            ...sportProfile,
            profileType: ProfileType.SPORT
        };
    }
    
    // Если не нашли спортивную анкету, ищем анкету игр
    const gameProfile = await prisma.gameProfile.findFirst({
        where: {
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
            isReviewed: false,
        },
        orderBy: { createdAt: 'asc' }
    });
    
    if (gameProfile) {
        return {
            ...gameProfile,
            profileType: ProfileType.GAME
        };
    }
    
    // Если не нашли анкету игр, ищем анкету хобби
    const hobbyProfile = await prisma.hobbyProfile.findFirst({
        where: {
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
            isReviewed: false,
        },
        orderBy: { createdAt: 'asc' }
    });
    
    if (hobbyProfile) {
        return {
            ...hobbyProfile,
            profileType: ProfileType.HOBBY
        };
    }
    
    // Если не нашли анкету хобби, ищем IT анкету
    const itProfile = await prisma.itProfile.findFirst({
        where: {
            isActive: true, 
            createdAt: { gte: sevenDaysAgo },
            isReviewed: false,
        },
        orderBy: { createdAt: 'asc' }
    });
    
    if (itProfile) {
        return {
            ...itProfile,
            profileType: ProfileType.IT
        };
    }
    
    // Если ничего не нашли, возвращаем null
    return null;
}

/**
 * Отмечает анкету как проверенную
 */
export async function markProfileAsReviewed(profileId: string, profileType: ProfileType) {
    switch (profileType) {
        case ProfileType.RELATIONSHIP:
            return prisma.relationshipProfile.update({
                where: { id: profileId },
                data: { isReviewed: true }
            });
        case ProfileType.SPORT:
            return prisma.sportProfile.update({
                where: { id: profileId },
                data: { isReviewed: true }
            });
        case ProfileType.GAME:
            return prisma.gameProfile.update({
                where: { id: profileId },
                data: { isReviewed: true }
            });
        case ProfileType.HOBBY:
            return prisma.hobbyProfile.update({
                where: { id: profileId },
                data: { isReviewed: true }
            });
        case ProfileType.IT:
            return prisma.itProfile.update({
                where: { id: profileId },
                data: { isReviewed: true }
            });
        default:
            return null;
    }
} 