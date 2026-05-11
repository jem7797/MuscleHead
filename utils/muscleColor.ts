/**
 * Returns a hex color based on how much time remains in the 48-hour worked-muscle window.
 * progress = 1.0 (just worked) -> accent #e85d04
 * progress = 0.0 (about to expire) -> accentDeep #c2410c (stays on-brand orange, not blue)
 */
export function getMuscleColor(expiresAt: string): string {
  const justWorked = { r: 232, g: 93, b: 4 }; // #e85d04 accent
  const aboutToExpire = { r: 194, g: 65, b: 12 }; // #c2410c accentDeep

  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const hoursRemaining = Math.max(0, (expires - now) / (1000 * 60 * 60));
  const progress = hoursRemaining / 48;

  const r = Math.round(aboutToExpire.r + (justWorked.r - aboutToExpire.r) * progress);
  const g = Math.round(aboutToExpire.g + (justWorked.g - aboutToExpire.g) * progress);
  const b = Math.round(aboutToExpire.b + (justWorked.b - aboutToExpire.b) * progress);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
