import type messages from "../../messages/en.json";
import type { Locale } from "@/lib/domain/locale";

// English is the source of truth for message keys; the parity test keeps
// Spanish in sync.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
