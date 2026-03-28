import type { Metadata } from "next";
import { ibmPlexMono, spaceGrotesk } from "@/app/fonts";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oblivion",
  description: "Short-lived anonymous posts. Lost to the void.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className="selection:bg-amber-500/25">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="void-frame void-panel px-4 py-6 sm:px-6 sm:py-8">
            <header className="border-b border-[var(--border)] pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href="/" className="group block">
                    <span className="panel-label mb-1.5 block group-hover:text-[var(--muted)]">
                      [ SYS / OBLIVION ]
                    </span>
                    <span className="glitch-title block text-2xl tracking-tight sm:text-3xl">
                      Oblivion
                    </span>
                  </Link>
                  <p className="mt-2 max-w-lg font-mono text-xs leading-relaxed text-[var(--muted)]">
                    Embrace Oblivion - scream, vanish; threads decay after 24 hours.
                  </p>
                </div>
                <div className="hidden shrink-0 text-right font-mono text-[0.65rem] leading-relaxed text-[var(--muted-faint)] sm:block">
                  <p>STATUS: EPHEMERAL</p>
                  <p className="mt-1">CHANNEL: OPEN</p>
                </div>
              </div>
            </header>
            <div id="main-content" className="pt-6">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
