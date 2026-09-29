"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { signOut } from "@/lib/server/auth-actions";

type AccountMenuProps = {
  email: string;
  /** The avatar, rendered by the server. */
  avatar: ReactNode;
};

/** Disclosure menu: the avatar opens the account details and sign out. */
export function AccountMenu({ email, avatar }: AccountMenuProps) {
  const t = useTranslations("Desk.account");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center overflow-hidden rounded-full border-2 border-chip-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        {avatar}
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 z-30 mt-2 w-64 rounded-lg bg-[#fdfbf5] p-2 text-ink shadow-[0_16px_32px_rgb(0_0_0/0.35)]"
      >
        <p className="px-3 pt-2 pb-3 text-sm break-words text-ink-soft">
          {t("signedInAs", { email })}
        </p>
        <Link
          ref={firstItemRef}
          href="/settings"
          className="block rounded-md px-3 py-2.5 font-medium hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          {t("settings")}
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2.5 text-left font-medium hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}
