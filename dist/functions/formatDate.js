"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatDuration = formatDuration;
function formatDate(date) {
    try {
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    catch (error) {
        return 'Unknown date';
    }
}
function formatDuration(durationMs, t) {
    try {
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        if (hours > 0) {
            return `${hours} ${t('time_hour')} ${minutes} ${t('time_minute')} ${seconds} ${t('time_second')}`;
        }
        else if (minutes > 0) {
            return `${minutes} ${t('time_minute')} ${seconds} ${t('time_second')}`;
        }
        else {
            return `${seconds} ${t('time_second')}`;
        }
    }
    catch (error) {
        return 'Unknown duration';
    }
}
