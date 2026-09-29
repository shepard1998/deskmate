export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

type LocaleSources = {
  /** Locale the user picked explicitly (profile or language switcher cookie). */
  preferred?: string | null;
  /** Raw `Accept-Language` header sent by the browser. */
  acceptLanguage?: string | null;
};

/**
 * Picks the UI locale (CLAUDE.md 4.2): the user's explicit choice first, then
 * the browser languages in order of preference, then the default locale.
 */
export function resolveLocale({
  preferred,
  acceptLanguage,
}: LocaleSources): Locale {
  if (isLocale(preferred)) {
    return preferred;
  }
  for (const language of parseAcceptLanguage(acceptLanguage ?? "")) {
    const primary = language.split("-")[0]?.toLowerCase();
    if (isLocale(primary)) {
      return primary;
    }
  }
  return defaultLocale;
}

/** Returns the language tags of an `Accept-Language` header, most preferred first. */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qParam ? Number(qParam.trim().slice(2)) : 1;
      return {
        tag: tag.trim(),
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      };
    })
    .filter(({ tag, quality }) => tag !== "" && tag !== "*" && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map(({ tag }) => tag);
}
