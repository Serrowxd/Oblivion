"use client";

import type { RefObject } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

function focusRange(
  el: HTMLTextAreaElement | null,
  start: number,
  end: number,
) {
  if (!el) return;
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start, end);
  });
}

export function MarkdownToolbar({ value, onChange, inputRef }: Props) {
  function insertHeading(level: 1 | 2 | 3) {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const hashes = level === 1 ? "# " : level === 2 ? "## " : "### ";
    const needsNewline = s > 0 && value[s - 1] !== "\n";
    const insertion = (needsNewline ? "\n" : "") + hashes;
    const next = value.slice(0, s) + insertion + value.slice(e);
    onChange(next);
    const pos = s + insertion.length;
    focusRange(el, pos, pos);
  }

  function wrap(before: string, after: string) {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const sel = value.slice(s, e);
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    if (sel) {
      focusRange(el, s + before.length, s + before.length + sel.length);
    } else {
      const mid = s + before.length;
      focusRange(el, mid, mid);
    }
  }

  function insertLinePrefix(prefix: string) {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const needsNewline = s > 0 && value[s - 1] !== "\n";
    const insertion = (needsNewline ? "\n" : "") + prefix;
    const next = value.slice(0, s) + insertion + value.slice(e);
    onChange(next);
    const pos = s + insertion.length;
    focusRange(el, pos, pos);
  }

  const btn =
    "rounded border border-[var(--border)] bg-[var(--void-elevated)] px-2 py-1 font-mono text-xs text-zinc-300 transition hover:border-[var(--accent-dim)] hover:text-zinc-100";

  return (
    <div
      className="flex flex-wrap gap-1.5 border-b border-[var(--border)] pb-2"
      role="toolbar"
      aria-label="Insert Markdown formatting"
    >
      <span className="mr-1 self-center font-mono text-[0.65rem] uppercase tracking-wider text-[var(--muted-faint)]">
        Md
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => insertHeading(1)}
        aria-label="Insert heading level 1"
      >
        H1
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => insertHeading(2)}
        aria-label="Insert heading level 2"
      >
        H2
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => insertHeading(3)}
        aria-label="Insert heading level 3"
      >
        H3
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => wrap("**", "**")}
        aria-label="Bold"
      >
        <strong className="font-semibold">B</strong>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => wrap("*", "*")}
        aria-label="Italic"
      >
        <em className="italic">I</em>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => wrap("`", "`")}
        aria-label="Inline code"
      >
        <span className="font-mono">{"`"}</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => wrap("[", "](url)")}
        aria-label="Insert link"
      >
        Link
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => insertLinePrefix("- ")}
        aria-label="Insert list item"
      >
        List
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => insertLinePrefix("> ")}
        aria-label="Insert blockquote"
      >
        Quote
      </button>
    </div>
  );
}
