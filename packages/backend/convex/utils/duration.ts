/**
 * Duration utility functions for parsing and formatting duration strings
 * Supports formats: "1d", "1.5d", "2h", "2.3h", "40m"
 */

/**
 * Parse a duration string to milliseconds
 * @param duration - Duration string (e.g., "1d", "2.5h", "40m")
 * @returns Milliseconds or null if invalid
 */
export function parseDuration(duration: string): number | null {
  if (!duration || typeof duration !== "string") {
    return null;
  }

  const trimmed = duration.trim().toLowerCase();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)(d|h|m)$/);

  if (!match) {
    return null;
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  if (isNaN(value) || value < 0) {
    return null;
  }

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000; // days to milliseconds
    case "h":
      return value * 60 * 60 * 1000; // hours to milliseconds
    case "m":
      return value * 60 * 1000; // minutes to milliseconds
    default:
      return null;
  }
}

/**
 * Format milliseconds to human-readable duration string
 * @param ms - Milliseconds
 * @returns Formatted duration string (e.g., "1d", "2.5h", "40m")
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return "0m";

  const days = ms / (24 * 60 * 60 * 1000);
  if (days >= 1) {
    return days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`;
  }

  const hours = ms / (60 * 60 * 1000);
  if (hours >= 1) {
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  }

  const minutes = Math.ceil(ms / (60 * 1000));
  return `${minutes}m`;
}

/**
 * Calculate actual durations from status history
 * @param statusHistory - Array of status history entries
 * @returns Map of status transitions to duration strings
 */
export function calculateActualDurations(
  statusHistory: Array<{
    status: string;
    timestamp: number;
    [key: string]: any;
  }>,
): Record<string, string> {
  const durations: Record<string, string> = {};

  if (!statusHistory || statusHistory.length < 2) {
    return durations;
  }

  // Sort by timestamp to ensure correct order
  const sorted = [...statusHistory].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const key = `${current.status}_to_${next.status}`;
    const duration = next.timestamp - current.timestamp;

    durations[key] = formatDuration(duration);
  }

  return durations;
}

/**
 * Validate duration string format
 * @param duration - Duration string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDuration(duration: string): boolean {
  return parseDuration(duration) !== null;
}
