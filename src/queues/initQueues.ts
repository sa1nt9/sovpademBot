import { logger } from "../logger";
import { notificationQueue } from "./notificationQueue";

export function initQueues() {
    // Логируем события очереди уведомлений
    notificationQueue.on('completed', (job, result) => {
        logger.info({
            jobId: job.id,
            result
        }, 'Notification job completed');
    });

    notificationQueue.on('failed', (job, error) => {
        logger.error({
            jobId: job.id,
            error: error.message,
            stack: error.stack
        }, 'Notification job failed');
    });

    notificationQueue.on('stalled', (jobId) => {
        logger.warn({
            jobId
        }, 'Notification job stalled');
    });

    logger.info('Queues initialized successfully');
}