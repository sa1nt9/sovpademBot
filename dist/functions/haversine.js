"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversine = haversine;
exports.formatDistance = formatDistance;
// Функция для вычисления расстояния между двумя точками (широта и долгота)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в километрах
    const toRad = (angle) => (Math.PI / 180) * angle;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Расстояние в километрах
}
// Функция форматирования расстояния в удобный для чтения вид
function formatDistance(distanceKm, t) {
    if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 10);
        if (meters < 100) {
            return t ? t('very_close_distance') : 'Очень близко';
        }
        return `${meters * 100} ${t ? t('meters') : 'м'}`;
    }
    return `${Math.round(distanceKm)} ${t ? t('kilometers') : 'км'}`;
}
