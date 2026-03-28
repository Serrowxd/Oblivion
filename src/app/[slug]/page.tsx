import { loadComments } from "@/app/actions/comment";
import { CommentForm } from "@/components/CommentForm";
import { MarkdownHtml } from "@/components/MarkdownHtml";
import { renderMarkdownUnsafe } from "@/lib/markdown";
import { commentAvatarUrl } from "@/lib/avatar-url";
import { resolveSlug } from "@/lib/resolve-slug";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await resolveSlug(slug);
  if (r.kind === "notfound") {
    return { title: "Not found — Oblivion" };
  }
  if (r.kind === "lost") {
    return { title: "Lost — Oblivion" };
  }
  return {
    title: `${r.post.title?.trim() || "Untitled"} — Oblivion`,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (resolved.kind === "notfound") {
    notFound();
  }

  if (resolved.kind === "lost") {
    return (
      <main className="space-y-6">
        <div className="void-panel panel-static panel-static-flicker space-y-4 p-4 sm:p-5">
          <p className="panel-label">[ SIGNAL_LOST ]</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-200 sm:text-3xl">
            LOST TO THE VOID
          </h1>
          <p className="font-mono text-sm leading-relaxed text-[var(--muted)]">
            This thread is gone. Nothing was kept.
          </p>
          <p>
            <Link href="/" className="link-signal font-mono text-sm">
              ← Back
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const post = resolved.post;
  const bodyHtml = renderMarkdownUnsafe(post.bodyMarkdown);
  const comments = await loadComments(post.id);

  return (
    <main className="space-y-8">
      <article className="void-panel space-y-4 p-4 sm:p-5">
        <p className="panel-label">[ THREAD ]</p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            {post.title?.trim() || "Untitled"}
          </h1>
        </div>
        <p className="font-mono text-xs text-[var(--muted)]">
          <span className="text-[var(--muted)]">{post.authorLabel}</span>
          {" · "}
          <time dateTime={post.createdAt.toISOString()}>
            {post.createdAt.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </p>
        <MarkdownHtml html={bodyHtml} />
      </article>

      <section className="void-panel space-y-5 p-4 sm:p-5">
        <h2 className="panel-label">[ REPLIES ]</h2>
        <ul className="space-y-6">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3 border-b border-[var(--border)] pb-6 last:border-0 last:pb-0">
              <Image
                src={commentAvatarUrl(c.avatarSeed)}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full border border-[var(--border)] bg-zinc-900 ring-1 ring-[var(--accent-dim)]/30"
                unoptimized
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2 font-mono text-sm">
                  <span className="font-medium text-zinc-200">
                    {c.displayName}
                  </span>
                  <time
                    className="text-xs text-[var(--muted-faint)]"
                    dateTime={c.createdAt.toISOString()}
                  >
                    {c.createdAt.toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
                <MarkdownHtml
                  html={renderMarkdownUnsafe(c.bodyMarkdown)}
                  className="mt-2 text-sm"
                />
              </div>
            </li>
          ))}
        </ul>

        <CommentForm postId={post.id} />
      </section>

      <p>
        <Link href="/" className="link-signal font-mono text-sm">
          ← Recent posts
        </Link>
      </p>
    </main>
  );
}
