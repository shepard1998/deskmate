import Link from "next/link";

import { LanguageSwitcher } from "./language-switcher";

type SiteHeaderProps = {
  /** Shows the app name as a link to the home page. */
  homeLink?: boolean;
};

export function SiteHeader({ homeLink = true }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 p-4">
      {homeLink ? (
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Deskmate
        </Link>
      ) : (
        <span />
      )}
      <LanguageSwitcher />
    </header>
  );
}
