"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubShortLinkRegex = exports.githubLinkRegex = void 0;
exports.githubLinkRegex = /^https:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9-]{1,39}(?:\/[a-zA-Z0-9-_.]+)?(?:\?[^#]*)?(?:#.*)?$/;
exports.githubShortLinkRegex = /^https:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9-]{1,39})/;
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
