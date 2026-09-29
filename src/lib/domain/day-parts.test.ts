import { describe, expect, test } from "vitest";

import { dayPartAt, hourInTimeZone } from "./day-parts";

describe("dayPartAt", () => {
  test.each([
    [5, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [17, "afternoon"],
    [18, "evening"],
    [21, "evening"],
    [22, "night"],
    [23, "night"],
    [0, "night"],
    [4, "night"],
  ])("hour %i is %s", (hour, part) => {
    expect(dayPartAt(hour)).toBe(part);
  });

  test("uses custom boundaries", () => {
    const starts = { morning: 7, afternoon: 13, evening: 19, night: 23 };
    expect(dayPartAt(6, starts)).toBe("night");
    expect(dayPartAt(12, starts)).toBe("morning");
    expect(dayPartAt(22, starts)).toBe("evening");
  });
});

describe("hourInTimeZone", () => {
  const instant = new Date("2026-09-29T14:30:00Z");

  test.each([
    ["UTC", 14],
    ["America/Bogota", 9],
    ["Europe/Madrid", 16],
    ["Asia/Tokyo", 23],
  ])("in %s it is %i", (zone, hour) => {
    expect(hourInTimeZone(instant, zone)).toBe(hour);
  });

  test("reports midnight as 0", () => {
    expect(hourInTimeZone(new Date("2026-09-29T00:10:00Z"), "UTC")).toBe(0);
  });
});
