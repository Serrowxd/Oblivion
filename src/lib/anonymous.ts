const ADJECTIVES = [
  "silent",
  "hollow",
  "fading",
  "lost",
  "drifting",
  "nameless",
  "veiled",
  "distant",
  "quiet",
  "empty",
  "cold",
  "dim",
  "still",
  "faint",
  "wandering",
];

const NOUNS = [
  "echo",
  "shadow",
  "visitor",
  "stranger",
  "ghost",
  "signal",
  "whisper",
  "void",
  "thread",
  "spark",
  "drift",
  "cipher",
  "fragment",
  "ember",
  "ripple",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}

/** Deterministic-ish label from a numeric seed (post author). */
export function authorLabelFromSeed(seed: number): string {
  const adj = pick(ADJECTIVES, seed);
  const noun = pick(NOUNS, seed >>> 8);
  return `${adj} ${noun}`;
}

/** Random label for new posts. */
export function randomAuthorLabel(): string {
  const seed = Math.floor(Math.random() * 2 ** 31);
  return authorLabelFromSeed(seed);
}

/** Random display name for commenters (new identity). */
export function randomCommenterName(): string {
  return randomAuthorLabel();
}

export function randomAvatarSeed(): string {
  return Math.random().toString(36).slice(2, 14);
}
