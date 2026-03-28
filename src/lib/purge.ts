import { sql } from "drizzle-orm";
import { getDb } from "@/db";

/**
 * Delete expired posts (cascades comments), insert tombstones for those slugs. Single statement, atomic.
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

  const row = result.rows[0] as { deleted: number } | undefined;
  const deleted = row?.deleted ?? 0;
  return { deleted };
}
