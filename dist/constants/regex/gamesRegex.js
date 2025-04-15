"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoyoverseProfileRegex = exports.battlenetProfileRegex = exports.activisionProfileRegex = exports.eaProfileRegex = exports.rockstarProfileRegex = exports.pubgProfileRegex = exports.fortniteProfileRegex = exports.lolProfileRegex = exports.minecraftProfileRegex = exports.riotProfileRegex = exports.faceitProfileRegex = exports.steamProfileRegex = void 0;
// Steam профиль (для CS:GO, Dota 2, Rust)
exports.steamProfileRegex = /https:\/\/(?:www\.)?steamcommunity\.com\/(?:id|profiles)\/([^\/\s]+)/;
// Faceit профиль (для CS:GO)
exports.faceitProfileRegex = /https:\/\/(?:www\.)?faceit\.com\/[a-z]{2}\/players\/([^\/\s]+)/;
// Riot Games профиль (для Valorant)
exports.riotProfileRegex = /https:\/\/(?:www\.)?tracker\.gg\/valorant\/profile\/riot\/([^\/\s]+)/;
// Minecraft профиль
exports.minecraftProfileRegex = /https:\/\/(?:www\.)?namemc\.com\/profile\/([^\/\s]+)/;
// League of Legends профиль
exports.lolProfileRegex = /https:\/\/(?:www\.)?op\.gg\/summoners\/(?:[a-z]{2,4})\/([^\/\s]+)/;
// Fortnite профиль
exports.fortniteProfileRegex = /https:\/\/(?:www\.)?fortnitetracker\.com\/profile\/all\/([^\/\s]+)/;
// PUBG профиль
exports.pubgProfileRegex = /https:\/\/(?:www\.)?pubg\.op\.gg\/user\/([^\/\s]+)/;
// Rockstar Social Club профиль
exports.rockstarProfileRegex = /https:\/\/(?:www\.)?socialclub\.rockstargames\.com\/member\/([^\/\s]+)/;
// EA профиль (для Apex Legends, FIFA)
exports.eaProfileRegex = /https:\/\/(?:www\.)?(?:apex\.tracker\.gg\/apex-legends\/profile\/origin|ea\.com\/games\/ea-sports-fc\/profile)\/([^\/\s]+)/;
// Activision профиль
exports.activisionProfileRegex = /https:\/\/(?:www\.)?callofduty\.com\/profile\/([^\/\s]+)/;
// Battle.net профиль (для WoW)
exports.battlenetProfileRegex = /https:\/\/(?:www\.)?worldofwarcraft\.com\/[a-z]{2}-[a-z]{2}\/character\/([^\/\s]+)/;
// HoYoverse профиль (для Genshin Impact)
exports.hoyoverseProfileRegex = /https:\/\/(?:www\.)?hoyolab\.com\/accountCenter\/userProfile\/([^\/\s]+)/;
