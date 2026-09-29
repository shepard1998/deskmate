import { describe, expect, test } from "vitest";

import { redirectForRoute } from "./route-access";

describe("redirectForRoute", () => {
  test("sends signed-out visitors of the desk to sign in, keeping the target", () => {
    expect(redirectForRoute("/desk", "", false)).toBe("/sign-in?next=%2Fdesk");
    expect(redirectForRoute("/desk/stats", "?range=week", false)).toBe(
      "/sign-in?next=%2Fdesk%2Fstats%3Frange%3Dweek",
    );
  });

  test("lets signed-in users reach the desk", () => {
    expect(redirectForRoute("/desk", "", true)).toBeNull();
  });

  test("sends signed-in users away from the auth pages", () => {
    expect(redirectForRoute("/sign-in", "", true)).toBe("/desk");
    expect(redirectForRoute("/sign-up", "", true)).toBe("/desk");
  });

  test("leaves public pages alone", () => {
    expect(redirectForRoute("/", "", false)).toBeNull();
    expect(redirectForRoute("/", "", true)).toBeNull();
    expect(redirectForRoute("/sign-in", "", false)).toBeNull();
  });

  test("does not treat similar prefixes as protected", () => {
    expect(redirectForRoute("/desktop", "", false)).toBeNull();
    expect(redirectForRoute("/sign-inx", "", true)).toBeNull();
  });
});
