"use client";

import { addComment } from "@/app/actions/comment";
import { MAX_COMMENT_BODY_CHARS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  postId: string;
};

export function CommentForm({ postId }: Props) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const tooLong = body.length > MAX_COMMENT_BODY_CHARS;
  const canSubmit =
    !pending && !tooLong && body.trim().length > 0;

  return (
    <form
      className="space-y-2 border-t border-[var(--border)] pt-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await addComment(postId, body);
          if (res && "error" in res && res.error) {
            setError(res.error);
            return;
          }
          setBody("");
          router.refresh();
        });
      }}
    >
      <label htmlFor="comment" className="label-void sr-only">
        Comment
      </label>
      <textarea
        id="comment"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="input-void w-full px-3 py-2 text-sm"
        placeholder="Anonymous reply…"
      />
      <p
        className={`text-right font-mono text-sm tabular-nums ${tooLong ? "text-amber-400" : "text-[var(--muted-faint)]"}`}
        aria-live="polite"
      >
        {body.length.toLocaleString()} / {MAX_COMMENT_BODY_CHARS.toLocaleString()}
      </p>
      {error ? (
        <p className="font-mono text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-void-secondary"
      >
        {pending ? "Sending…" : "Comment"}
      </button>
    </form>
  );
}
