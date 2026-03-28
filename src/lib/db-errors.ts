/** PostgreSQL `unique_violation` — e.g. slug race under concurrent inserts. */
export function isPostgresUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string" &&
    (e as { code: string }).code === "23505"
  );
}
