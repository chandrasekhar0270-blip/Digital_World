// lib/calculations.ts
// Speed and pace calculation formulas

export function calculateSpeed(distanceKm: number, durationSec: number): number {
  // Speed (km/h) = distance / (duration in hours)
  if (durationSec <= 0 || distanceKm <= 0) return 0;
  return Math.round((distanceKm / (durationSec / 3600)) * 10) / 10;
}

export function calculatePace(distanceKm: number, durationSec: number): number {
  // Pace (min/km) = (duration in minutes) / distance
  if (durationSec <= 0 || distanceKm <= 0) return 0;
  return Math.round(((durationSec / 60) / distanceKm) * 100) / 100;
}

export function formatPace(paceMinKm: number): string {
  if (!paceMinKm || !isFinite(paceMinKm)) return "--:--";
  const mins = Math.floor(paceMinKm);
  const secs = Math.round((paceMinKm - mins) * 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatWeekday(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}
