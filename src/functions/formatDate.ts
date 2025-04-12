import { logger } from "../logger";

export function formatDate(date: Date): string {
    try {
        const formattedDate = date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        logger.info({ date: date.toISOString(), formattedDate }, 'Formatted date');
        return formattedDate;
    } catch (error) {
        logger.error({ 
            date: date.toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error formatting date');
        return 'Unknown date';
    }
}

export function formatDuration(durationMs: number, t: (key: string) => string): string {
    try {
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        
        let formattedDuration = '';
        if (hours > 0) {
            formattedDuration = `${hours} ${t('time_hour')} ${minutes} ${t('time_minute')} ${seconds} ${t('time_second')}`;
        } else if (minutes > 0) {
            formattedDuration = `${minutes} ${t('time_minute')} ${seconds} ${t('time_second')}`;
        } else {
            formattedDuration = `${seconds} ${t('time_second')}`;
        }
        
        logger.info({ durationMs, formattedDuration }, 'Formatted duration');
        return formattedDuration;
    } catch (error) {
        logger.error({ 
            durationMs,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error formatting duration');
        return 'Unknown duration';
    }
} 