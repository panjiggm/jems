/**
 * Duration utility functions for parsing and formatting duration strings
 * Supports formats: "1d", "1.5d", "2h", "2.3h", "40m"
 */

export type DurationUnit = "d" | "h" | "m";

export interface ParsedDuration {
  value: number;
  unit: DurationUnit;
}

/**
 * Parse a duration string to its components
 * @param str - Duration string (e.g., "1d", "2.5h", "40m")
 * @returns Parsed duration or null if invalid
 */
export function parseDurationString(str: string): ParsedDuration | null {
  if (!str || typeof str !== "string") {
    return null;
  }

  const trimmed = str.trim().toLowerCase();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)(d|h|m)$/);

  if (!match) {
    return null;
  }

  const value = parseFloat(match[1]);
  const unit = match[2] as DurationUnit;

  if (isNaN(value) || value < 0) {
    return null;
  }

  return { value, unit };
}

/**
 * Format duration components to string
 * @param value - Numeric value
 * @param unit - Duration unit
 * @returns Formatted duration string (e.g., "1d", "2.5h", "40m")
 */
export function formatDurationString(
  value: number,
  unit: DurationUnit,
): string {
  if (isNaN(value) || value < 0) {
    return "";
  }

  // Remove trailing zeros from decimal
  const formattedValue =
    value % 1 === 0 ? value.toString() : value.toFixed(1).replace(/\.0$/, "");

  return `${formattedValue}${unit}`;
}

/**
 * Validate duration string format
 * @param str - Duration string to validate
 * @returns true if valid, false otherwise
 */
export function validateDurationFormat(str: string): boolean {
  if (!str || typeof str !== "string") {
    return false;
  }

  return parseDurationString(str) !== null;
}

/**
 * Parse duration string to milliseconds
 * @param duration - Duration string (e.g., "1d", "2.5h", "40m")
 * @returns Milliseconds or null if invalid
 */
export function parseDurationToMs(duration: string): number | null {
  const parsed = parseDurationString(duration);
  if (!parsed) {
    return null;
  }

  switch (parsed.unit) {
    case "d":
      return parsed.value * 24 * 60 * 60 * 1000; // days to milliseconds
    case "h":
      return parsed.value * 60 * 60 * 1000; // hours to milliseconds
    case "m":
      return parsed.value * 60 * 1000; // minutes to milliseconds
    default:
      return null;
  }
}

/**
 * Format milliseconds to human-readable duration string
 * @param ms - Milliseconds
 * @returns Formatted duration string (e.g., "1d", "2.5h", "40m")
 */
export function formatMsToDuration(ms: number): string {
  if (ms < 0) return "0m";

  const days = ms / (24 * 60 * 60 * 1000);
  if (days >= 1) {
    return formatDurationString(days, "d");
  }

  const hours = ms / (60 * 60 * 1000);
  if (hours >= 1) {
    return formatDurationString(hours, "h");
  }

  const minutes = Math.ceil(ms / (60 * 1000));
  return formatDurationString(minutes, "m");
}

/**
 * Get duration unit label
 * @param unit - Duration unit
 * @returns Label for display
 */
export function getDurationUnitLabel(unit: DurationUnit): string {
  switch (unit) {
    case "d":
      return "days";
    case "h":
      return "hours";
    case "m":
      return "minutes";
    default:
      return "";
  }
}

/**
 * Get duration unit short label
 * @param unit - Duration unit
 * @returns Short label for display
 */
export function getDurationUnitShortLabel(unit: DurationUnit): string {
  switch (unit) {
    case "d":
      return "d";
    case "h":
      return "h";
    case "m":
      return "min";
    default:
      return "";
  }
}
