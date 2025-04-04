import { GameType } from "@prisma/client";
import { battlenetProfileRegex, hoyoverseProfileRegex, activisionProfileRegex, eaProfileRegex, faceitProfileRegex, fortniteProfileRegex, lolProfileRegex, minecraftProfileRegex, pubgProfileRegex, rockstarProfileRegex, riotProfileRegex, steamProfileRegex } from "../constants/regex/gamesRegex";

export const gameLocalizationKeys: Record<GameType, string> = {
    [GameType.CS_GO]: 'game_account_cs_go',
    [GameType.DOTA2]: 'game_account_dota2',
    [GameType.VALORANT]: 'game_account_valorant',
    [GameType.RUST]: 'game_account_rust',
    [GameType.MINECRAFT]: 'game_account_minecraft',
    [GameType.LEAGUE_OF_LEGENDS]: 'game_account_league_of_legends',
    [GameType.FORTNITE]: 'game_account_fortnite',
    [GameType.PUBG]: 'game_account_pubg',
    [GameType.GTA]: 'game_account_gta',
    [GameType.APEX_LEGENDS]: 'game_account_apex_legends',
    [GameType.FIFA]: 'game_account_fifa',
    [GameType.CALL_OF_DUTY]: 'game_account_call_of_duty',
    [GameType.WOW]: 'game_account_wow',
    [GameType.GENSHIN_IMPACT]: 'game_account_genshin_impact'
};

export const getGameUsername = (gameType: GameType, link: string): string | false => {
    try {
        switch (gameType) {
            case GameType.CS_GO:
                console.log(link)
                // Проверяем оба формата для CS:GO
                const steamMatch = link.match(steamProfileRegex);
                console.log(steamMatch)
                if (steamMatch) return `${steamMatch[1]}:steam`;
                
                const faceitMatch = link.match(faceitProfileRegex);
                if (faceitMatch) return `${faceitMatch[1]}:faceit`;
                return false;

            case GameType.DOTA2:
            case GameType.RUST:
                const steamUsername = link.match(steamProfileRegex);
                return steamUsername ? steamUsername[1] : false;

            case GameType.VALORANT:
                const riotUsername = link.match(riotProfileRegex);
                return riotUsername ? riotUsername[1] : false;

            case GameType.MINECRAFT:
                const minecraftUsername = link.match(minecraftProfileRegex);
                return minecraftUsername ? minecraftUsername[1] : false;

            case GameType.LEAGUE_OF_LEGENDS:
                const lolUsername = link.match(lolProfileRegex);
                return lolUsername ? lolUsername[1] : false;

            case GameType.FORTNITE:
                const fortniteUsername = link.match(fortniteProfileRegex);
                return fortniteUsername ? fortniteUsername[1] : false;

            case GameType.PUBG:
                const pubgUsername = link.match(pubgProfileRegex);
                return pubgUsername ? pubgUsername[1] : false;

            case GameType.GTA:
                const rockstarUsername = link.match(rockstarProfileRegex);
                return rockstarUsername ? rockstarUsername[1] : false;

            case GameType.APEX_LEGENDS:
            case GameType.FIFA:
                const eaUsername = link.match(eaProfileRegex);
                return eaUsername ? eaUsername[1] : false;

            case GameType.CALL_OF_DUTY:
                const activisionUsername = link.match(activisionProfileRegex);
                return activisionUsername ? activisionUsername[1] : false;

            case GameType.WOW:
                const battlenetUsername = link.match(battlenetProfileRegex);
                return battlenetUsername ? battlenetUsername[1] : false;

            case GameType.GENSHIN_IMPACT:
                const hoyoverseUsername = link.match(hoyoverseProfileRegex);
                return hoyoverseUsername ? hoyoverseUsername[1] : false;

            default:
                return false;
        }
    } catch (error) {
        return false;
    }
};

export const getGameProfileLink = (gameType: GameType, username: string): string[] => {
    switch (gameType) {
        case GameType.CS_GO: {
            const [name, platform] = username.split(':');
            if (platform === 'faceit') {
                return [`https://www.faceit.com/players/${name}`, platform];
            }
            return [`https://steamcommunity.com/id/${name}`, platform];
        }

        case GameType.DOTA2:
        case GameType.RUST:
            return [`https://steamcommunity.com/id/${username}`];

        case GameType.VALORANT:
            return [`https://tracker.gg/valorant/profile/riot/${username}`];

        case GameType.MINECRAFT:
            return [`https://namemc.com/profile/${username}`];

        case GameType.LEAGUE_OF_LEGENDS:
            return [`https://www.op.gg/summoners/euw/${username}`];

        case GameType.FORTNITE:
            return [`https://fortnitetracker.com/profile/all/${username}`];

        case GameType.PUBG:
            return [`https://pubg.op.gg/user/${username}`];

        case GameType.GTA:
            return [`https://socialclub.rockstargames.com/member/${username}`];

        case GameType.APEX_LEGENDS:
            return [`https://apex.tracker.gg/apex-legends/profile/origin/${username}`];

        case GameType.FIFA:
            return [`https://www.ea.com/games/ea-sports-fc/profile/${username}`];

        case GameType.CALL_OF_DUTY:
            return [`https://www.callofduty.com/profile/${username}`];

        case GameType.WOW:
            return [`https://worldofwarcraft.com/en-us/character/${username}`];

        case GameType.GENSHIN_IMPACT:
            return [`https://hoyolab.com/accountCenter/userProfile/${username}`];

        default:
            return [];
    }
};

export const getGameUsernameToShow = (gameType: GameType, username: string): string => {
    switch (gameType) {
        case GameType.CS_GO:
            return username.split(':')[0];
        default:
            return username;
    }
}