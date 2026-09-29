import Link from "next/link";
import { useTranslations } from "next-intl";

import { Avatar } from "@/components/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";

import { AccountMenu } from "./account-menu";

type DeskTopBarProps = {
  displayName: string;
  avatarUrl: string | null;
  email: string;
};

export function DeskTopBar({ displayName, avatarUrl, email }: DeskTopBarProps) {
  const t = useTranslations("Desk.account");

  return (
    <header className="relative z-20 flex h-15 items-center justify-between gap-3 bg-bar px-4 text-on-wood sm:px-7">
      <Link
        href="/desk"
        className="font-display text-2xl tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
      >
        Deskmate
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* The theme toggle (F1.3) and the Pomodoro timer (F3.2) go here. */}
        <LanguageSwitcher />
        <Link
          href="/settings"
          aria-label={t("settings")}
          className="flex size-11 items-center justify-center rounded-full border border-chip-border bg-chip focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </Link>
        <AccountMenu
          email={email}
          avatar={<Avatar name={displayName} url={avatarUrl} size={40} />}
        />
      </div>
    </header>
  );
}
