"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import {
  dayParts,
  defaultDayPartStarts,
  type DayPart,
} from "@/lib/domain/day-parts";

/** Tasks shown done in the placeholder sheets, until F2 brings real data. */
const sampleDoneCount: Record<DayPart, number> = {
  morning: 3,
  afternoon: 1,
  evening: 0,
  night: 0,
};

type SheetStackProps = {
  /** The day part the user is in now; its sheet opens first. */
  currentPart: DayPart;
  /** Already localized, e.g. "Tuesday, September 29". */
  dateLabel: string;
  displayName: string;
};

export function SheetStack({
  currentPart,
  dateLabel,
  displayName,
}: SheetStackProps) {
  const t = useTranslations("Desk");
  const tParts = useTranslations("DayParts");
  const format = useFormatter();
  const [selected, setSelected] = useState<DayPart>(currentPart);
  const tabRefs = useRef<Partial<Record<DayPart, HTMLButtonElement | null>>>(
    {},
  );
  const baseId = useId();
  const tabId = (part: DayPart) => `${baseId}-tab-${part}`;
  const panelId = `${baseId}-panel`;

  // Arrow keys, Home, and End move between tabs (WAI-ARIA tabs pattern).
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = dayParts.indexOf(selected);
    const last = dayParts.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const part = dayParts[next] ?? currentPart;
    setSelected(part);
    tabRefs.current[part]?.focus();
  }

  const tasks = t.raw(`sample.${selected}`) as string[];
  const anytime = t.raw("sample.anytime") as string[];
  const doneCount = sampleDoneCount[selected];

  const nextPart =
    dayParts[(dayParts.indexOf(selected) + 1) % dayParts.length] ?? "morning";
  const range = format.dateTimeRange(
    new Date(Date.UTC(2000, 0, 1, defaultDayPartStarts[selected])),
    new Date(Date.UTC(2000, 0, 1, defaultDayPartStarts[nextPart])),
    { hour: "2-digit", minute: "2-digit", timeZone: "UTC" },
  );

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div
        role="tablist"
        aria-label={t("dayPartsLabel")}
        className="relative z-10 flex gap-1 px-2 sm:gap-1.5 sm:px-6"
      >
        {dayParts.map((part) => {
          const isSelected = part === selected;
          return (
            <button
              key={part}
              ref={(element) => {
                tabRefs.current[part] = element;
              }}
              id={tabId(part)}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(part)}
              onKeyDown={onTabKeyDown}
              className={`min-h-11 flex-1 rounded-t-[10px] px-2 font-hand text-[calc(var(--hand-scale)*17px)] shadow-[0_-2px_6px_rgb(0_0_0/0.12)] transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 motion-reduce:transition-none sm:flex-none sm:px-4 ${
                isSelected
                  ? "translate-y-0 bg-paper font-bold text-ink"
                  : "translate-y-1.5 bg-paper-back text-ink-soft hover:translate-y-1"
              }`}
            >
              {tParts(part)}
            </button>
          );
        })}
      </div>

      <div className="relative">
        {/* Sheets waiting underneath. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-1 rotate-[2deg] bg-paper-back shadow-[0_12px_24px_rgb(0_0_0/0.25)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -translate-x-1 rotate-[-1.4deg] bg-paper-back shadow-[0_12px_24px_rgb(0_0_0/0.22)]"
        />

        <section
          key={selected}
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(selected)}
          className="paper-sheet animate-sheet-in relative flex min-h-[560px] flex-col px-5 pt-8 pb-6 pl-[calc(var(--margin)+20px)] text-ink shadow-[0_18px_36px_rgb(0_0_0/0.35),0_2px_4px_rgb(0_0_0/0.2)] [--margin:34px] sm:px-12 sm:pl-[calc(var(--margin)+20px)] sm:[--margin:56px] lg:min-h-[calc(100dvh-150px)]"
        >
          {/* Header: plain paper above the first rule, like a notepad. */}
          <div className="flex flex-col gap-3 pb-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-soft uppercase">
              {dateLabel}
            </p>
            <h1 className="font-hand text-[calc(var(--hand-scale)*38px)] leading-none font-bold">
              {t(`greeting.${currentPart}`, { name: displayName })}
            </h1>
            <p className="text-sm text-ink-soft">
              {tParts(selected)} · {range} ·{" "}
              {t("progress", { done: doneCount, total: tasks.length })}
            </p>
          </div>

          {/*
           * Every row is one rule tall, so text always sits on its line. The
           * rules run edge to edge across the sheet, like real paper.
           */}
          <div className="-mr-5 -ml-[calc(var(--margin)+20px)] flex grow flex-col sm:-mr-12">
            <ul className="flex flex-col border-t border-rule">
              {tasks.map((task, index) => (
                <SheetLine
                  key={task}
                  label={task}
                  done={index < doneCount}
                  doneLabel={t("done")}
                />
              ))}
            </ul>

            <h2 className="flex h-[72px] items-end border-b border-rule pr-5 pb-0.5 pl-[calc(var(--margin)+20px)] font-hand text-[calc(var(--hand-scale)*24px)] font-bold sm:pr-12">
              {t("anytime")}
            </h2>
            <ul className="flex flex-col">
              {anytime.map((task) => (
                <SheetLine
                  key={task}
                  label={task}
                  done={false}
                  doneLabel={t("done")}
                />
              ))}
            </ul>
            <div aria-hidden="true" className="ruled-fill -mb-6 grow" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SheetLine({
  label,
  done,
  doneLabel,
}: {
  label: string;
  done: boolean;
  doneLabel: string;
}) {
  return (
    <li className="flex h-9 items-end gap-3 border-b border-rule pr-5 pb-1 pl-[calc(var(--margin)+20px)] sm:pr-12">
      <span
        aria-hidden="true"
        className="mb-0.5 flex size-[22px] shrink-0 -rotate-3 items-center justify-center rounded-[4px] border-2 border-[#3a3f4b]"
      >
        {done ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-pencil"
          >
            <path d="M4 13l5 5L20 6" />
          </svg>
        ) : null}
      </span>
      <span
        className={`truncate pr-1.5 font-hand text-[calc(var(--hand-scale)*21px)] leading-none ${
          done
            ? "text-[#6f675e] line-through decoration-pencil decoration-2"
            : ""
        }`}
      >
        {label}
      </span>
      {done ? <span className="sr-only">({doneLabel})</span> : null}
    </li>
  );
}
