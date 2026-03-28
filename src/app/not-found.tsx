import Link from "next/link";

export default function NotFound() {
  return (
    <main className="space-y-6">
      <div className="void-panel space-y-4 p-4 sm:p-5">
        <p className="panel-label">[ NULL_ROUTE ]</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Nothing here
        </h1>
        <p className="font-mono text-sm leading-relaxed text-[var(--muted)]">
          That address never existed in Oblivion.
        </p>
        <p>
          <Link href="/" className="link-signal font-mono text-sm">
            ← Home
          </Link>
        </p>
      </div>
    </main>
  );
}
