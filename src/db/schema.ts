import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title"),
    bodyMarkdown: text("body_markdown").notNull(),
    authorLabel: text("author_label").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("posts_expires_at_idx").on(t.expiresAt)]
);

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  anonKeyHash: text("anon_key_hash").notNull(),
  displayName: text("display_name").notNull(),
  avatarSeed: text("avatar_seed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tombstones = pgTable("tombstones", {
  slug: text("slug").primaryKey(),
  vanishedAt: timestamp("vanished_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
