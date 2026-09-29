import { Caveat, Fraunces, Instrument_Sans } from "next/font/google";

// Self-hosted at build time. The latin subset covers Spanish (á, é, ñ, ¿, ¡).

/** UI chrome. */
export const uiFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

/** The Deskmate wordmark. */
export const displayFont = Fraunces({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-display-face",
  display: "swap",
});

/** Handwriting on paper. Kalam and Patrick Hand join it in F1.2. */
export const caveatFont = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});
