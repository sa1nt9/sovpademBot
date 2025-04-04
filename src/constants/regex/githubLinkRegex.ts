export const githubLinkRegex = /^https:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9-]{1,39}(?:\/[a-zA-Z0-9-_.]+)?(?:\?[^#]*)?(?:#.*)?$/;

export const githubShortLinkRegex = /^https:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9-]{1,39})/;

// Примеры валидных ссылок:
// https://github.com/username
// https://www.github.com/username
// https://github.com/user-name
// https://github.com/user123
// https://github.com/username?tab=repositories
// https://github.com/username#readme
// https://github.com/username/repo
// https://github.com/username/repo?tab=readme
// https://github.com/username/repo#readme
// https://github.com/username/repo?tab=readme#readme

// Примеры невалидных ссылок:
// https://github.com/
// https://github.com/username/
// https://github.com/username/repo/

