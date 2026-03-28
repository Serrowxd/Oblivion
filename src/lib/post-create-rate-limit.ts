import { headers } from "next/headers";
import {
  POST_CREATE_RATE_LIMIT_MAX,
  POST_CREATE_RATE_LIMIT_WINDOW_MS,
} from "@/lib/limits";

type Bucket = number[];

const hitsByKey = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

function evictIfNeeded() {
  while (hitsByKey.size > MAX_TRACKED_KEYS) {
    const first = hitsByKey.keys().next().value;
    if (first === undefined) {
      break;
    }
    hitsByKey.delete(first);
  }
}

function clientKey(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  const fromForwarded = forwarded?.split(",")[0]?.trim();
  if (fromForwarded) {
    return fromForwarded;
  }
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * In-memory sliding window per client IP. Best-effort on serverless (per-instance);
 * use Upstash or similar if you need a global limit.
 */
export async function assertPostCreateRateLimit(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const h = await headers();
  const key = clientKey(h);
  const now = Date.now();
  const windowStart = now - POST_CREATE_RATE_LIMIT_WINDOW_MS;

  let bucket = hitsByKey.get(key);
  if (!bucket) {
    bucket = [];
    hitsByKey.set(key, bucket);
    evictIfNeeded();
  }

  const pruned = bucket.filter((t) => t > windowStart);
  hitsByKey.set(key, pruned);

  if (pruned.length >= POST_CREATE_RATE_LIMIT_MAX) {
    return { ok: false, message: "Too many posts. Try again in a little while." };
  }

  pruned.push(now);
  return { ok: true };
}
