import { describe, expect, test } from "vitest";

import { locales } from "@/lib/domain/locale";

import en from "../../messages/en.json";
import es from "../../messages/es.json";

const messages: Record<(typeof locales)[number], unknown> = { en, es };

/** Flattens nested messages into `{ "Section.key": "text" }`. */
function flatten(value: unknown, prefix = ""): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return { [prefix]: value };
  }
  return Object.entries(value).reduce<Record<string, unknown>>(
    (acc, [key, child]) => ({
      ...acc,
      ...flatten(child, prefix ? `${prefix}.${key}` : key),
    }),
    {},
  );
}

/** Names of the ICU arguments used in a message, e.g. `{name}` → `name`. */
function argumentNames(message: string): string[] {
  return [...message.matchAll(/\{\s*(\w+)/g)]
    .map((match) => match[1] ?? "")
    .sort();
}

const reference = flatten(messages.en);

describe.each(locales)("messages/%s.json", (locale) => {
  const flat = flatten(messages[locale]);

  test("has exactly the same keys as English", () => {
    expect(Object.keys(flat).sort()).toEqual(Object.keys(reference).sort());
  });

  test("has only non-empty strings", () => {
    for (const [key, text] of Object.entries(flat)) {
      expect(typeof text, key).toBe("string");
      expect((text as string).trim(), key).not.toBe("");
    }
  });

  test("uses the same ICU arguments as English", () => {
    for (const [key, text] of Object.entries(flat)) {
      const englishText = reference[key];
      if (typeof text === "string" && typeof englishText === "string") {
        expect(argumentNames(text), key).toEqual(argumentNames(englishText));
      }
    }
  });
});
