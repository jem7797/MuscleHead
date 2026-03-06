/**
 * Returns a hex color based on how much time remains in the 48-hour worked-muscle window.
 * progress = 1.0 (just worked) -> navbar blue #202c76
 * progress = 0.0 (about to expire) -> #1A56DB
 */
export function getMuscleColor(expiresAt: string): string {
  const justWorked = { r: 32, g: 44, b: 118 }; // #202c76 (navbar blue)
  const aboutToExpire = { r: 26, g: 86, b: 219 }; // #1A56DB

  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const hoursRemaining = Math.max(0, (expires - now) / (1000 * 60 * 60));
  const progress = hoursRemaining / 48;

  const r = Math.round(aboutToExpire.r + (justWorked.r - aboutToExpire.r) * progress);
  const g = Math.round(aboutToExpire.g + (justWorked.g - aboutToExpire.g) * progress);
  const b = Math.round(aboutToExpire.b + (justWorked.b - aboutToExpire.b) * progress);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
