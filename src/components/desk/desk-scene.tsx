import { useFormatter, useTranslations } from "next-intl";

import type { DayPart } from "@/lib/domain/day-parts";

import { CorkBoard } from "./cork-board";
import { DeskCalendar } from "./desk-calendar";
import { DeskTopBar } from "./desk-top-bar";
import { MobileObjectBar } from "./mobile-object-bar";
import { Pencil } from "./pencil";
import { SheetStack } from "./sheet-stack";
import { StickyNotes } from "./sticky-notes";

export type DeskStyle = {
  wood: "walnut" | "oak" | "ebony";
  paper: "ivory" | "white" | "recycled";
  hand: "caveat";
};

/** Until the style picker (F1.4), every desk uses the first style. */
export const defaultDeskStyle: DeskStyle = {
  wood: "walnut",
  paper: "ivory",
  hand: "caveat",
};

type DeskSceneProps = {
  displayName: string;
  avatarUrl: string | null;
  email: string;
  now: Date;
  timeZone: string;
  currentPart: DayPart;
  style?: DeskStyle;
};

/**
 * The desk: a wooden surface with the sheet stack in the middle and the desk
 * objects around it. Below `lg`, the objects fold into a bottom bar and the
 * sheets fill the screen.
 */
export function DeskScene({
  displayName,
  avatarUrl,
  email,
  now,
  timeZone,
  currentPart,
  style = defaultDeskStyle,
}: DeskSceneProps) {
  const t = useTranslations("Desk");
  const format = useFormatter();
  const dateLabel = format.dateTime(now, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  });

  return (
    <div
      data-wood={style.wood}
      data-paper={style.paper}
      data-hand={style.hand}
      className="desk-surface relative min-h-dvh overflow-x-clip"
    >
      <a
        href="#sheet"
        className="absolute top-2 left-2 z-50 -translate-y-20 rounded-md bg-white px-4 py-2 font-medium text-ink focus:translate-y-0"
      >
        {t("skipToSheet")}
      </a>
      <DeskTopBar
        displayName={displayName}
        avatarUrl={avatarUrl}
        email={email}
      />

      <div className="mx-auto grid max-w-[1440px] gap-10 px-3 pt-5 pb-28 sm:px-6 lg:grid-cols-[minmax(180px,1fr)_minmax(0,520px)_minmax(180px,1fr)] lg:gap-6 lg:px-8 lg:pt-6 lg:pb-10 xl:grid-cols-[minmax(200px,1fr)_minmax(0,560px)_minmax(200px,1fr)] xl:gap-10 xl:px-10">
        <div className="hidden pt-16 lg:block">
          <div className="mx-auto max-w-[330px]">
            <StickyNotes />
          </div>
        </div>

        <main id="sheet" tabIndex={-1} className="relative outline-none">
          <SheetStack
            currentPart={currentPart}
            dateLabel={dateLabel}
            displayName={displayName}
          />
          <Pencil className="absolute right-[-120px] bottom-6 hidden -rotate-[35deg] xl:flex" />
        </main>

        <div className="hidden flex-col items-center gap-10 pt-10 lg:flex">
          <DeskCalendar now={now} timeZone={timeZone} />
          <CorkBoard />
        </div>
      </div>

      <MobileObjectBar />
    </div>
  );
}
