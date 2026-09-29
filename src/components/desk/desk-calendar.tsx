import { useFormatter, useTranslations } from "next-intl";

type DeskCalendarProps = {
  now: Date;
  timeZone: string;
};

/** A flip calendar showing today in the user's time zone and language. */
export function DeskCalendar({ now, timeZone }: DeskCalendarProps) {
  const t = useTranslations("Desk");
  const format = useFormatter();
  const month = format
    .dateTime(now, { month: "short", timeZone })
    .replace(".", "");
  const day = format.dateTime(now, { day: "numeric", timeZone });
  const weekday = format.dateTime(now, { weekday: "long", timeZone });

  return (
    <section
      aria-labelledby="desk-calendar"
      className="flex flex-col items-center"
    >
      <div
        role="img"
        aria-label={format.dateTime(now, { dateStyle: "full", timeZone })}
        className="relative w-[164px] rotate-2 shadow-[0_14px_22px_rgb(0_0_0/0.35)]"
      >
        <span
          aria-hidden="true"
          className="absolute -top-1.5 left-9 size-3 rounded-full bg-[#3a3a3a]"
        />
        <span
          aria-hidden="true"
          className="absolute -top-1.5 right-9 size-3 rounded-full bg-[#3a3a3a]"
        />
        <div className="rounded-t-lg bg-[#a83c2a] py-2 text-center text-lg font-semibold tracking-[0.2em] text-white uppercase">
          {month}
        </div>
        <div className="flex flex-col items-center rounded-b-lg bg-[#fbf7ee] pt-1 pb-3">
          <span className="font-display text-[56px] leading-tight text-ink">
            {day}
          </span>
          <span className="text-sm text-ink-soft">{weekday}</span>
        </div>
      </div>
      <h2
        id="desk-calendar"
        className="mt-3 text-[13px] font-medium text-on-wood"
      >
        {t("objects.calendar")}
      </h2>
    </section>
  );
}
