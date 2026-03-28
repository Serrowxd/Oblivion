"use server";

import { getDb } from "@/db";
import { posts, tombstones } from "@/db/schema";
import { randomAuthorLabel } from "@/lib/anonymous";
import {
  MAX_POST_BODY_CHARS,
  MAX_TITLE_CHARS,
  POST_TTL_HOURS,
} from "@/lib/limits";
import { purgeExpiredPosts } from "@/lib/purge";
import { createSlug } from "@/lib/slug";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

function titleTooLongMessage() {
  return `Title is too long — shorten it to ${MAX_TITLE_CHARS} characters or less.`;
}

export async function createPost(formData: FormData) {
  const titleRaw = formData.get("title");
  const body = formData.get("body");
  const title =
    typeof titleRaw === "string" ? titleRaw.trim() : "";
  const bodyStr = typeof body === "string" ? body : "";

  if (bodyStr.trim().length === 0) {
    return { error: "Write something before publishing." };
  }
  if (bodyStr.length > MAX_POST_BODY_CHARS) {
    return { error: "Post body is too long." };
  }
  if (title.length > MAX_TITLE_CHARS) {
    return { error: titleTooLongMessage() };
  }

  const db = getDb();
  await purgeExpiredPosts();

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

    await db.insert(posts).values({
      slug,
      title: title.length > 0 ? title : null,
      bodyMarkdown: bodyStr,
      authorLabel: randomAuthorLabel(),
      expiresAt,
    });

    redirect(`/${slug}`);
  }

  return { error: "Could not allocate a unique URL. Try again." };
}

export async function loadRecentPostsForHome() {
  await purgeExpiredPosts();
  const db = getDb();
  // Live posts only: not expired, and slug not tombstoned (vanished / purged).
  return db
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
}
