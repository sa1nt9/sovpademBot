"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGithubUserExists = exports.getGithubUsername = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const githubLinkRegex_1 = require("../constants/regex/githubLinkRegex");
const getGithubUsername = (link) => {
    const match = link.match(githubLinkRegex_1.githubShortLinkRegex);
    return match ? match[1] : null;
};
exports.getGithubUsername = getGithubUsername;
const checkGithubUserExists = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = (input.startsWith('http') || input.startsWith('www')) ? (0, exports.getGithubUsername)(input) : input;
        if (!username)
            return false;
        const response = yield (0, node_fetch_1.default)(`https://api.github.com/users/${username}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SovpademBot'
            }
        });
        return response.status === 200;
    }
    catch (error) {
        console.error('Error checking GitHub user:', error);
        return false;
    }
});
exports.checkGithubUserExists = checkGithubUserExists;
// Примеры работы getGithubUsername:
// getGithubUsername('https://github.com/username?tab=repositories') -> 'username'
// getGithubUsername('https://github.com/username#readme') -> 'username'
// getGithubUsername('https://github.com/username/repo?tab=readme#readme') -> 'username'
// getGithubUsername('https://github.com/username') -> 'username'
// getGithubUsername('https://github.com/') -> null
// Примеры работы checkGithubUserExists:
// await checkGithubUserExists('https://github.com/username') -> true/false
// await checkGithubUserExists('username') -> true/false
