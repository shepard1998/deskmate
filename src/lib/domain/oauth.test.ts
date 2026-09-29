import { describe, expect, test } from "vitest";

import { oauthCallbackUrl, oauthErrorKey, oauthFailure } from "./oauth";

describe("oauthCallbackUrl", () => {
  test("points to the callback route of the given origin", () => {
    expect(oauthCallbackUrl("http://localhost:3000", null)).toBe(
      "http://localhost:3000/auth/callback",
    );
  });

  test("omits the return path when it is the default", () => {
    expect(oauthCallbackUrl("http://localhost:3000", "/desk")).toBe(
      "http://localhost:3000/auth/callback",
    );
  });

  test("keeps an internal return path", () => {
    expect(oauthCallbackUrl("http://localhost:3000", "/desk/stats?w=1")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fdesk%2Fstats%3Fw%3D1",
    );
  });

  test("drops an external return path", () => {
    expect(oauthCallbackUrl("http://localhost:3000", "//evil.example")).toBe(
      "http://localhost:3000/auth/callback",
    );
  });
});

describe("oauthFailure", () => {
  test("treats access_denied as a cancellation", () => {
    expect(oauthFailure("access_denied")).toBe("github_cancelled");
  });

  test.each([null, "server_error", "invalid_request"])(
    "treats %j as a failure",
    (error) => {
      expect(oauthFailure(error)).toBe("github_failed");
    },
  );
});

describe("oauthErrorKey", () => {
  test("maps known sign-in errors to message keys", () => {
    expect(oauthErrorKey("github_cancelled")).toBe("githubCancelled");
    expect(oauthErrorKey("github_failed")).toBe("githubFailed");
  });

  test.each([undefined, "", "other", ["github_failed"]])(
    "ignores %j",
    (param) => {
      expect(oauthErrorKey(param)).toBeNull();
    },
  );
});
