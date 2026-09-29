import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/**
 * On small screens the desk objects collapse into this bar. The items become
 * buttons as each object gets its feature (F3.1, F4.1, F7.1).
 */
export function MobileObjectBar() {
  const t = useTranslations("Desk.objects");

  const items = [
    {
      label: t("calendarShort"),
      icon: (
        <Icon>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </Icon>
      ),
    },
    {
      label: t("stickyNotesShort"),
      icon: (
        <Icon>
          <path d="M4 4h16v11l-5 5H4z" />
          <path d="M15 20v-5h5" />
        </Icon>
      ),
    },
    {
      label: t("corkBoardShort"),
      icon: (
        <Icon>
          <circle cx="12" cy="8" r="4" />
          <path d="M12 12v9" />
        </Icon>
      ),
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-[#f3ecdd] pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_16px_rgb(0_0_0/0.25)] lg:hidden">
      <ul
        aria-label={t("deskObjects")}
        className="mx-auto grid h-[72px] max-w-md grid-cols-3"
      >
        {items.map((item) => (
          <li
            key={item.label}
            className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-[#3a3530]"
          >
            {item.icon}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
