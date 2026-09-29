import { describe, expect, test } from "vitest";

import { parseEnv } from "./env";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
};

describe("parseEnv", () => {
  test("returns the variables when they are valid", () => {
    expect(parseEnv(validEnv)).toEqual(validEnv);
  });

  test("ignores unrelated variables", () => {
    expect(parseEnv({ ...validEnv, NODE_ENV: "test" })).toEqual(validEnv);
  });

  test("names every missing variable", () => {
    expect(() => parseEnv({})).toThrow(
      "Invalid or missing environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  });

  test("rejects a URL that is not valid", () => {
    expect(() =>
      parseEnv({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  test("rejects a blank key", () => {
    expect(() =>
      parseEnv({ ...validEnv, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "   " }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  test("never includes values in the error message", () => {
    const secretLooking = "sb_publishable_should_not_leak";
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "nope",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining(secretLooking),
      }),
    );
    expect(() => parseEnv({ NEXT_PUBLIC_SUPABASE_URL: secretLooking })).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining(secretLooking),
      }),
    );
  });
});
