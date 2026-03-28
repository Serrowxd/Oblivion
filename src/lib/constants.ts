/** Defaults; server uses `lib/limits.ts` to allow env overrides. */
export const MAX_POST_BODY_CHARS = 30_000;
export const MAX_COMMENT_BODY_CHARS = 8_000;
export const MAX_TITLE_CHARS = 200;

/** Per-IP sliding window for `createPost` (server action). */
export const POST_CREATE_RATE_LIMIT_MAX = 10;
export const POST_CREATE_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
