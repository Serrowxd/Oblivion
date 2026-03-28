export type ParsedCompose =
  | { ok: true; title: string; body: string }
  | { ok: false; error: string };

/**
 * Normal server action input: string fields from the compose form.
 * Rejects multipart file blobs or other non-string values as malformed.
 */
export function parseComposeFormData(formData: globalThis.FormData): ParsedCompose {
  const titleRaw = formData.get("title");
  const bodyRaw = formData.get("body");

  if (titleRaw != null && typeof titleRaw !== "string") {
    return { ok: false, error: "Invalid form data." };
  }
  if (bodyRaw != null && typeof bodyRaw !== "string") {
    return { ok: false, error: "Invalid form data." };
  }

  const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
  const body = typeof bodyRaw === "string" ? bodyRaw : "";

  return { ok: true, title, body };
}
