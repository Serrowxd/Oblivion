import {
  MAX_COMMENT_BODY_CHARS as D_COMMENT,
  MAX_POST_BODY_CHARS as D_POST,
  MAX_TITLE_CHARS as D_TITLE,
} from "./constants";

export const MAX_POST_BODY_CHARS =
  Number(process.env.MAX_POST_BODY_CHARS) || D_POST;
export const MAX_COMMENT_BODY_CHARS =
  Number(process.env.MAX_COMMENT_BODY_CHARS) || D_COMMENT;
export const MAX_TITLE_CHARS = Number(process.env.MAX_TITLE_CHARS) || D_TITLE;

export const POST_TTL_HOURS = Number(process.env.POST_TTL_HOURS) || 24;
