/**
 * Ephemeral comment avatars — DiceBear "glass" (translucent abstract shapes).
 * Dark cool gradients so they read as ethereal on the void UI.
 * @see https://www.dicebear.com/styles/glass/
 */
export function commentAvatarUrl(seed: string): string {
  const q = new URLSearchParams();
  q.set("seed", seed);
  q.set("backgroundColor", "1a1628,0f1729,1e1b32");
  q.set("backgroundType", "gradientLinear");
  return `https://api.dicebear.com/9.x/glass/svg?${q.toString()}`;
}
