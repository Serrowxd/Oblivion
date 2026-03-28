"use server";

import { getDb } from "@/db";
import { posts, tombstones } from "@/db/schema";
import { randomAuthorLabel } from "@/lib/anonymous";
import { parseComposeFormData } from "@/lib/compose-form";
import { isPostgresUniqueViolation } from "@/lib/db-errors";
import {
  MAX_POST_BODY_CHARS,
  MAX_TITLE_CHARS,
  POST_TTL_HOURS,
} from "@/lib/limits";
import { assertPostCreateRateLimit } from "@/lib/post-create-rate-limit";
import { tryPurgeExpiredPosts } from "@/lib/purge";
import { createSlug } from "@/lib/slug";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

const DB_UNAVAILABLE =
  "The void is unreachable right now. Try again in a moment.";

function titleTooLongMessage() {
  return `Title is too long — shorten it to ${MAX_TITLE_CHARS} characters or less.`;
}

export type RecentFeedPost = {
  slug: string;
  title: string | null;
  authorLabel: string;
  createdAt: Date;
  expiresAt: Date;
};

export type RecentPostsForHomeResult =
  | { ok: true; posts: RecentFeedPost[] }
  | { ok: false };

export async function createPost(formData: FormData) {
  const parsed = parseComposeFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  const { title, body: bodyStr } = parsed;

  if (bodyStr.trim().length === 0) {
    return { error: "Write something before publishing." };
  }
  if (bodyStr.length > MAX_POST_BODY_CHARS) {
    return { error: "Post body is too long." };
  }
  if (title.length > MAX_TITLE_CHARS) {
    return { error: titleTooLongMessage() };
  }

  const rate = await assertPostCreateRateLimit();
  if (!rate.ok) {
    return { error: rate.message };
  }

  let createdSlug: string | null = null;

  try {
    await tryPurgeExpiredPosts();
    const db = getDb();

    for (let attempt = 0; attempt < 12; attempt++) {
      const slug = createSlug();
      const clashPost = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);
      const clashTomb = await db
        .select({ slug: tombstones.slug })
        .from(tombstones)
        .where(eq(tombstones.slug, slug))
        .limit(1);
      if (clashPost.length > 0 || clashTomb.length > 0) {
        continue;
      }

      const expiresAt = new Date(
        Date.now() + POST_TTL_HOURS * 60 * 60 * 1000
      );

      try {
        await db.insert(posts).values({
          slug,
          title: title.length > 0 ? title : null,
          bodyMarkdown: bodyStr,
          authorLabel: randomAuthorLabel(),
          expiresAt,
        });
      } catch (e) {
        if (isPostgresUniqueViolation(e)) {
          continue;
        }
        throw e;
      }

      createdSlug = slug;
      break;
    }
  } catch (e) {
    console.error("createPost:", e);
    return { error: DB_UNAVAILABLE };
  }

  if (createdSlug) {
    redirect(`/${createdSlug}`);
  }

  return { error: "Could not allocate a unique URL. Try again." };
}

export async function loadRecentPostsForHome(): Promise<RecentPostsForHomeResult> {
  await tryPurgeExpiredPosts();
  try {
    const db = getDb();
    const rows = await db
      .select({
        slug: posts.slug,
        title: posts.title,
        authorLabel: posts.authorLabel,
        createdAt: posts.createdAt,
        expiresAt: posts.expiresAt,
      })
      .from(posts)
      .leftJoin(tombstones, eq(posts.slug, tombstones.slug))
      .where(
        and(gt(posts.expiresAt, sql`now()`), isNull(tombstones.slug)),
      )
      .orderBy(desc(posts.createdAt))
      .limit(50);
    return { ok: true, posts: rows };
  } catch (e) {
    console.error("loadRecentPostsForHome:", e);
    return { ok: false };
  }
}
