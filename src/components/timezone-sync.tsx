"use client";

import { useEffect } from "react";

import { saveDetectedTimeZone } from "@/lib/server/settings-actions";

/** Reports the browser's time zone once, while the profile has none. */
export function TimezoneSync({ hasTimezone }: { hasTimezone: boolean }) {
  useEffect(() => {
    if (!hasTimezone) {
      void saveDetectedTimeZone(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
    }
  }, [hasTimezone]);

  return null;
}
