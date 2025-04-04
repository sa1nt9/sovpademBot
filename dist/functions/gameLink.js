"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameUsernameToShow = exports.getGameProfileLink = exports.getGameUsername = exports.gameLocalizationKeys = void 0;
const client_1 = require("@prisma/client");
const gamesRegex_1 = require("../constants/regex/gamesRegex");
exports.gameLocalizationKeys = {
    [client_1.GameType.CS_GO]: 'game_account_cs_go',
    [client_1.GameType.DOTA2]: 'game_account_dota2',
    [client_1.GameType.VALORANT]: 'game_account_valorant',
    [client_1.GameType.RUST]: 'game_account_rust',
    [client_1.GameType.MINECRAFT]: 'game_account_minecraft',
    [client_1.GameType.LEAGUE_OF_LEGENDS]: 'game_account_league_of_legends',
    [client_1.GameType.FORTNITE]: 'game_account_fortnite',
    [client_1.GameType.PUBG]: 'game_account_pubg',
    [client_1.GameType.GTA]: 'game_account_gta',
    [client_1.GameType.APEX_LEGENDS]: 'game_account_apex_legends',
    [client_1.GameType.FIFA]: 'game_account_fifa',
    [client_1.GameType.CALL_OF_DUTY]: 'game_account_call_of_duty',
    [client_1.GameType.WOW]: 'game_account_wow',
    [client_1.GameType.GENSHIN_IMPACT]: 'game_account_genshin_impact'
};
const getGameUsername = (gameType, link) => {
    try {
        switch (gameType) {
            case client_1.GameType.CS_GO:
                console.log(link);
                // Проверяем оба формата для CS:GO
                const steamMatch = link.match(gamesRegex_1.steamProfileRegex);
                console.log(steamMatch);
                if (steamMatch)
                    return `${steamMatch[1]}:steam`;
                const faceitMatch = link.match(gamesRegex_1.faceitProfileRegex);
                if (faceitMatch)
                    return `${faceitMatch[1]}:faceit`;
                return false;
            case client_1.GameType.DOTA2:
            case client_1.GameType.RUST:
                const steamUsername = link.match(gamesRegex_1.steamProfileRegex);
                return steamUsername ? steamUsername[1] : false;
            case client_1.GameType.VALORANT:
                const riotUsername = link.match(gamesRegex_1.riotProfileRegex);
                return riotUsername ? riotUsername[1] : false;
            case client_1.GameType.MINECRAFT:
                const minecraftUsername = link.match(gamesRegex_1.minecraftProfileRegex);
                return minecraftUsername ? minecraftUsername[1] : false;
            case client_1.GameType.LEAGUE_OF_LEGENDS:
                const lolUsername = link.match(gamesRegex_1.lolProfileRegex);
                return lolUsername ? lolUsername[1] : false;
            case client_1.GameType.FORTNITE:
                const fortniteUsername = link.match(gamesRegex_1.fortniteProfileRegex);
                return fortniteUsername ? fortniteUsername[1] : false;
            case client_1.GameType.PUBG:
                const pubgUsername = link.match(gamesRegex_1.pubgProfileRegex);
                return pubgUsername ? pubgUsername[1] : false;
            case client_1.GameType.GTA:
                const rockstarUsername = link.match(gamesRegex_1.rockstarProfileRegex);
                return rockstarUsername ? rockstarUsername[1] : false;
            case client_1.GameType.APEX_LEGENDS:
            case client_1.GameType.FIFA:
                const eaUsername = link.match(gamesRegex_1.eaProfileRegex);
                return eaUsername ? eaUsername[1] : false;
            case client_1.GameType.CALL_OF_DUTY:
                const activisionUsername = link.match(gamesRegex_1.activisionProfileRegex);
                return activisionUsername ? activisionUsername[1] : false;
            case client_1.GameType.WOW:
                const battlenetUsername = link.match(gamesRegex_1.battlenetProfileRegex);
                return battlenetUsername ? battlenetUsername[1] : false;
            case client_1.GameType.GENSHIN_IMPACT:
                const hoyoverseUsername = link.match(gamesRegex_1.hoyoverseProfileRegex);
                return hoyoverseUsername ? hoyoverseUsername[1] : false;
            default:
                return false;
        }
    }
    catch (error) {
        return false;
    }
};
exports.getGameUsername = getGameUsername;
const getGameProfileLink = (gameType, username) => {
    switch (gameType) {
        case client_1.GameType.CS_GO: {
            const [name, platform] = username.split(':');
            if (platform === 'faceit') {
                return [`https://www.faceit.com/players/${name}`, platform];
            }
            return [`https://steamcommunity.com/id/${name}`, platform];
        }
        case client_1.GameType.DOTA2:
        case client_1.GameType.RUST:
            return [`https://steamcommunity.com/id/${username}`];
        case client_1.GameType.VALORANT:
            return [`https://tracker.gg/valorant/profile/riot/${username}`];
        case client_1.GameType.MINECRAFT:
            return [`https://namemc.com/profile/${username}`];
        case client_1.GameType.LEAGUE_OF_LEGENDS:
            return [`https://www.op.gg/summoners/euw/${username}`];
        case client_1.GameType.FORTNITE:
            return [`https://fortnitetracker.com/profile/all/${username}`];
        case client_1.GameType.PUBG:
            return [`https://pubg.op.gg/user/${username}`];
        case client_1.GameType.GTA:
            return [`https://socialclub.rockstargames.com/member/${username}`];
        case client_1.GameType.APEX_LEGENDS:
            return [`https://apex.tracker.gg/apex-legends/profile/origin/${username}`];
        case client_1.GameType.FIFA:
            return [`https://www.ea.com/games/ea-sports-fc/profile/${username}`];
        case client_1.GameType.CALL_OF_DUTY:
            return [`https://www.callofduty.com/profile/${username}`];
        case client_1.GameType.WOW:
            return [`https://worldofwarcraft.com/en-us/character/${username}`];
        case client_1.GameType.GENSHIN_IMPACT:
            return [`https://hoyolab.com/accountCenter/userProfile/${username}`];
        default:
            return [];
    }
};
exports.getGameProfileLink = getGameProfileLink;
const getGameUsernameToShow = (gameType, username) => {
    switch (gameType) {
        case client_1.GameType.CS_GO:
            return username.split(':')[0];
        default:
            return username;
    }
};
exports.getGameUsernameToShow = getGameUsernameToShow;
