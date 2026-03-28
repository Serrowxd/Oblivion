"use client";

import { createPost } from "@/app/actions/post";
import {
  MAX_POST_BODY_CHARS,
  MAX_TITLE_CHARS,
} from "@/lib/constants";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";
import { useRef, useState, useTransition } from "react";

export function ComposerForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const titleTooLong = title.length > MAX_TITLE_CHARS;
  const bodyTooLong = body.length > MAX_POST_BODY_CHARS;
  const canSubmit =
    !pending &&
    !titleTooLong &&
    !bodyTooLong &&
    body.trim().length > 0;

  function titleErrorMessage() {
    return `Title is too long — shorten it to ${MAX_TITLE_CHARS} characters or less.`;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createPost(fd);
      if (res && "error" in res && res.error) {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label-void">
          Title <span className="normal-case text-[var(--muted-faint)]">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-void mt-2 w-full px-3 py-2 text-sm"
          placeholder="Scream"
          maxLength={MAX_TITLE_CHARS + 50}
          aria-invalid={titleTooLong}
          aria-describedby={titleTooLong ? "title-err" : undefined}
        />
        {titleTooLong ? (
          <p
            id="title-err"
            className="mt-1 font-mono text-sm text-amber-400"
            role="status"
            aria-live="polite"
          >
            {titleErrorMessage()}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="body" className="label-void">
          Body <span className="text-amber-400/90">*</span>
        </label>
        <MarkdownToolbar value={body} onChange={setBody} inputRef={bodyRef} />
        <textarea
          ref={bodyRef}
          id="body"
          name="body"
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input-void mt-2 w-full px-3 py-2 text-sm"
          placeholder="Write here… Images: ![](https://...)"
        />
        <p
          className={`mt-1 text-right font-mono text-sm tabular-nums ${bodyTooLong ? "text-amber-400" : "text-[var(--muted-faint)]"}`}
          aria-live="polite"
        >
          {body.length.toLocaleString()} / {MAX_POST_BODY_CHARS.toLocaleString()}
        </p>
      </div>

      {error ? (
        <p className="font-mono text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-void-primary"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}
