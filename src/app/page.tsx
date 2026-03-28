import { ComposerForm } from "@/components/ComposerForm";
import { loadRecentPostsForHome } from "@/app/actions/post";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function HomePage() {
  const recent = await loadRecentPostsForHome();

  return (
    <main className="space-y-8">
      <h1 className="sr-only">Home — compose and recent posts</h1>

      <section className="void-panel space-y-4 p-4 sm:p-5">
        <h2 className="panel-label">[ COMPOSE ]</h2>
        <ComposerForm />
      </section>

      <section className="void-panel space-y-4 p-4 sm:p-5">
        <h2 className="panel-label">[ RECENT_FEED ]</h2>
        <ul className="divide-y divide-[var(--border)]">
          {recent.length === 0 ? (
            <li className="py-4 font-mono text-sm text-[var(--muted)]">
              Nothing here yet. Be the first.
            </li>
          ) : (
            recent.map((p) => (
              <li key={p.slug} className="py-4 first:pt-0 last:pb-0">
                <Link href={`/${p.slug}`} className="link-signal text-base font-medium">
                  {p.title?.trim() || "Untitled"}
                </Link>
                <div className="mt-2 flex flex-wrap gap-x-4 font-mono text-xs text-[var(--muted-faint)]">
                  <span>{p.authorLabel}</span>
                  <span>{formatWhen(p.createdAt)}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
