import { describe, expect, test } from "vitest";

import { isLocale, resolveLocale } from "./locale";

describe("resolveLocale", () => {
  test("uses the preferred locale when it is supported", () => {
    expect(resolveLocale({ preferred: "es", acceptLanguage: "en-US" })).toBe(
      "es",
    );
  });

  test("ignores an unsupported preferred locale", () => {
    expect(resolveLocale({ preferred: "fr", acceptLanguage: "es-ES" })).toBe(
      "es",
    );
  });

  test("matches a regional browser language to its base locale", () => {
    expect(resolveLocale({ acceptLanguage: "es-MX,es;q=0.9,en;q=0.8" })).toBe(
      "es",
    );
  });

  test("respects quality values over header order", () => {
    expect(resolveLocale({ acceptLanguage: "en;q=0.5,es;q=0.9" })).toBe("es");
  });

  test("skips unsupported browser languages", () => {
    expect(resolveLocale({ acceptLanguage: "fr-FR,de;q=0.9,es;q=0.8" })).toBe(
      "es",
    );
  });

  test("skips languages the browser rejects with q=0", () => {
    expect(resolveLocale({ acceptLanguage: "es;q=0,fr" })).toBe("en");
  });

  test("falls back to English when nothing matches", () => {
    expect(resolveLocale({ acceptLanguage: "fr-FR,*" })).toBe("en");
  });

  test("falls back to English without any source", () => {
    expect(resolveLocale({})).toBe("en");
    expect(resolveLocale({ preferred: null, acceptLanguage: "" })).toBe("en");
  });

  test("tolerates a malformed header", () => {
    expect(resolveLocale({ acceptLanguage: ";;,q=abc, ,es;q=x" })).toBe("en");
  });
});

describe("isLocale", () => {
  test("accepts only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("ES")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
