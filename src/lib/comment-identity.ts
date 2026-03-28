import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { randomAvatarSeed, randomCommenterName } from "./anonymous";

const COOKIE_NAME = "oblivion_identity";

export type CommentIdentity = {
  key: string;
  displayName: string;
  avatarSeed: string;
};

function secret(): string {
  return process.env.COOKIE_SECRET ?? "development-only-change-me";
}

export function hashAnonKey(key: string): string {
  return createHash("sha256")
    .update(key + secret())
    .digest("hex");
}

export function signIdentity(i: CommentIdentity): string {
  const payload = Buffer.from(JSON.stringify(i), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyIdentity(signed: string): CommentIdentity | null {
  const dot = signed.indexOf(".");
  if (dot === -1) return null;
  const payload = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(raw) as CommentIdentity;
  } catch {
    return null;
  }
}

export function newIdentity(): CommentIdentity {
  return {
    key: randomBytes(16).toString("hex"),
    displayName: randomCommenterName(),
    avatarSeed: randomAvatarSeed(),
  };
}

export { COOKIE_NAME };
