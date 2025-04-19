import { Report } from "@prisma/client";
import { prisma } from "../../db/postgres";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";


/**
 * Получает следующую активную жалобу из базы данных
 */
export const getNextReport = async (): Promise<Report | null> => {
    return await prisma.report.findFirst({
        where: {
            isActive: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};

/**
 * Рассчитывает дату окончания бана в зависимости от выбранного периода
 */
export const calculateBanEndDate = (banPeriod: string): Date => {
    const now = new Date();

    switch (banPeriod) {
        case '1day':
            return addDays(now, 1);
        case '1week':
            return addWeeks(now, 1);
        case '1month':
            return addMonths(now, 1);
        case '1year':
            return addYears(now, 1);
        case 'permanent':
            return addYears(now, 100); // Практически "навсегда" - 100 лет
        default:
            return addDays(now, 1); // По умолчанию 1 день
    }
};

/**
 * Баны пользователя и помечает жалобу как обработанную
 */
export const banUserAndResolveReport = async (userId: string, reportId: string, banPeriod: string, reason?: string): Promise<void> => {
    const bannedUntil = calculateBanEndDate(banPeriod);

    if (reportId) {
        // Транзакция для обновления и жалобы, и создания бана
        await prisma.report.update({
            where: { id: reportId },
            data: { isActive: false }
        });
    }
    
    // Создаем запись о бане пользователя
    await prisma.userBan.create({
        data: {
            userId,
            reason,
            bannedUntil,
            isActive: true
        }
    })

    await prisma.userBan.updateMany({
        where: {
            userId,
            isActive: true,
            bannedUntil: {
                lt: bannedUntil
            }
        },
        data: { isActive: false }
    });
}; 