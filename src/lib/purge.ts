import { sql } from "drizzle-orm";
import { getDb } from "@/db";

/**
 * Delete expired posts (cascades comments), insert tombstones for those slugs.
 * One SQL statement → one transaction on Postgres; no partial delete vs tombstone apply.
 */
export async function purgeExpiredPosts(): Promise<{ deleted: number }> {
  const db = getDb();

  const result = await db.execute(sql`
    WITH del AS (
      DELETE FROM posts WHERE expires_at <= now() RETURNING slug
    ),
    ins AS (
      INSERT INTO tombstones (slug, vanished_at)
      SELECT slug, now() FROM del
      ON CONFLICT (slug) DO NOTHING
    )
    SELECT count(*)::int AS deleted FROM del
  `);

  const row = result.rows[0] as { deleted: number | string } | undefined;
  const raw = row?.deleted ?? 0;
  const deleted =
    typeof raw === "number" ? raw : Number.parseInt(String(raw), 10) || 0;
  return { deleted };
}

/** For user-facing routes: never fail the page if purge cannot run. */
export async function tryPurgeExpiredPosts(): Promise<void> {
  try {
    await purgeExpiredPosts();
  } catch (e) {
    console.error("tryPurgeExpiredPosts:", e);
  }
}
