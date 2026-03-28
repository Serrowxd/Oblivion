import { getDb } from "@/db";
import { posts, tombstones } from "@/db/schema";
import type { Post } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export type SlugResolution =
  | { kind: "live"; post: Post }
  | { kind: "lost" }
  | { kind: "notfound" };

export async function resolveSlug(slug: string): Promise<SlugResolution> {
  const db = getDb();

  const live = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), sql`${posts.expiresAt} > now()`))
    .limit(1);

  if (live[0]) {
    return { kind: "live", post: live[0] };
  }

  const expiredOrTomb = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, slug), sql`${posts.expiresAt} <= now()`))
    .limit(1);

  if (expiredOrTomb.length > 0) {
    return { kind: "lost" };
  }

  const tomb = await db
    .select()
    .from(tombstones)
    .where(eq(tombstones.slug, slug))
    .limit(1);

  if (tomb[0]) {
    return { kind: "lost" };
  }

  return { kind: "notfound" };
}
