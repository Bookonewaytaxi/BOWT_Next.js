/**
 * Pure, deterministic travel-time estimate.
 * No network calls, no Maps API, no LLM. Input: distance_km only.
 */
const AVG_SPEED_KMPH = 45;

export function estimateTravelTimeRange(distanceKm) {
  if (typeof distanceKm !== 'number' || !isFinite(distanceKm) || distanceKm <= 0) {
    return null;
  }

  const lowHours = distanceKm / (AVG_SPEED_KMPH * 1.15);
  const highHours = distanceKm / (AVG_SPEED_KMPH * 0.85);

  const formatHours = (h) => Math.round(h * 2) / 2;

  const low = formatHours(lowHours);
  const high = formatHours(highHours);

  if (low === high) {
    return `approximately ${low} hours`;
  }
  return `approximately ${low}–${high} hours`;
}
