"use server";

import { getDb } from "@/db";
import { comments, posts } from "@/db/schema";
import {
  COOKIE_NAME,
  hashAnonKey,
  newIdentity,
  signIdentity,
  verifyIdentity,
} from "@/lib/comment-identity";
import { MAX_COMMENT_BODY_CHARS } from "@/lib/limits";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";

export async function loadComments(postId: string) {
  const db = getDb();
  return db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));
}

export async function addComment(postId: string, body: string) {
  if (body.length > MAX_COMMENT_BODY_CHARS) {
    return { error: "Comment is too long." };
  }
  if (body.trim().length === 0) {
    return { error: "Comment cannot be empty." };
  }

  const db = getDb();
  const live = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(eq(posts.id, postId), sql`${posts.expiresAt} > now()`)
    )
    .limit(1);

  if (live.length === 0) {
    return { error: "This thread is closed or gone." };
  }

  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;

  let identity = raw ? verifyIdentity(raw) : null;
  if (!identity) {
    identity = newIdentity();
  }

  const anonKeyHash = hashAnonKey(identity.key);

  await db.insert(comments).values({
    postId,
    bodyMarkdown: body,
    anonKeyHash,
    displayName: identity.displayName,
    avatarSeed: identity.avatarSeed,
  });

  jar.set(COOKIE_NAME, signIdentity(identity), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });

  const [pathRow] = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (pathRow) {
    revalidatePath(`/${pathRow.slug}`);
  }

  return { ok: true as const };
}
