import fetch from 'node-fetch';
import { githubShortLinkRegex } from '../constants/regex/githubLinkRegex';
import { logger } from '../logger';

export const getGithubUsername = (link: string): string | null => {
    const match = link.match(githubShortLinkRegex);
    const username = match ? match[1] : null;
    
    if (username) {
        logger.info({ link, username }, 'Extracted GitHub username');
    } else {
        logger.warn({ link }, 'Failed to extract GitHub username');
    }
    
    return username;
};

export const checkGithubUserExists = async (input: string): Promise<boolean> => {
    try {
        const username = (input.startsWith('http') || input.startsWith('www')) ? getGithubUsername(input) : input;
        if (!username) {
            logger.warn({ input }, 'No valid GitHub username found');
            return false;
        }

        logger.info({ username }, 'Checking GitHub user existence');
        
        const response = await fetch(`https://api.github.com/users/${username}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SovpademBot'
            }
        });

        const exists = response.status === 200;
        logger.info({ username, exists }, 'GitHub user check completed');
        
        return exists;
    } catch (error) {
        logger.error({ 
            input,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error checking GitHub user');
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