export const dayParts = ["morning", "afternoon", "evening", "night"] as const;

export type DayPart = (typeof dayParts)[number];

/**
 * Default boundaries (CLAUDE.md 4.3), as the hour each part starts. Night runs
 * until the next morning. F2.2 makes them configurable per user.
 */
export const defaultDayPartStarts: Record<DayPart, number> = {
  morning: 5,
  afternoon: 12,
  evening: 18,
  night: 22,
};

/** The day part an hour of the local day (0–23) belongs to. */
export function dayPartAt(
  hour: number,
  starts: Record<DayPart, number> = defaultDayPartStarts,
): DayPart {
  if (hour >= starts.night || hour < starts.morning) return "night";
  if (hour >= starts.evening) return "evening";
  if (hour >= starts.afternoon) return "afternoon";
  return "morning";
}

/** The hour (0–23) of an instant in a time zone, e.g. for `dayPartAt`. */
export function hourInTimeZone(instant: Date, timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone,
  }).format(instant);
  return Number(hour);
}
