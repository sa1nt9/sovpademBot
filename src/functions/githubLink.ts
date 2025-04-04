import fetch from 'node-fetch';
import { githubShortLinkRegex } from '../constants/regex/githubLinkRegex';

export const getGithubUsername = (link: string): string | null => {
    const match = link.match(githubShortLinkRegex);
    return match ? match[1] : null;
};

export const checkGithubUserExists = async (input: string): Promise<boolean> => {
    try {
        const username = (input.startsWith('http') || input.startsWith('www')) ? getGithubUsername(input) : input;
        if (!username) return false;

        const response = await fetch(`https://api.github.com/users/${username}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SovpademBot'
            }
        });

        return response.status === 200;
    } catch (error) {
        console.error('Error checking GitHub user:', error);
        return false;
    }
};

// Примеры работы getGithubUsername:
// getGithubUsername('https://github.com/username?tab=repositories') -> 'username'
// getGithubUsername('https://github.com/username#readme') -> 'username'
// getGithubUsername('https://github.com/username/repo?tab=readme#readme') -> 'username'
// getGithubUsername('https://github.com/username') -> 'username'
// getGithubUsername('https://github.com/') -> null

// Примеры работы checkGithubUserExists:
// await checkGithubUserExists('https://github.com/username') -> true/false
// await checkGithubUserExists('username') -> true/false