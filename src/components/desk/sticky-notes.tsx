import { useTranslations } from "next-intl";

// Placeholder notes until F3.1 makes them editable and draggable. Sizes and
// positions follow the column width (container query units), so the cluster
// fits from 1024 px up without overlapping the sheet.
const noteStyles = [
  "bg-[#fde68a] text-[#3b3326] -rotate-5 left-0 top-[2cqw]",
  "bg-[#fbcfe8] text-[#3b2632] rotate-4 left-[50%] top-0",
  "bg-[#bfdbfe] text-[#1f2d3f] -rotate-2 left-[20%] top-[min(168px,52cqw)]",
];

export function StickyNotes() {
  const t = useTranslations("Desk");
  const notes = t.raw("sample.notes") as string[];

  return (
    <section aria-labelledby="desk-sticky-notes" className="@container">
      <ul className="relative h-[min(330px,102cqw)]">
        {notes.map((note, index) => (
          <li
            key={note}
            className={`absolute size-[min(148px,46cqw)] p-[min(16px,5cqw)] font-hand text-[calc(var(--hand-scale)*min(19px,5.8cqw))] leading-[1.15] shadow-[0_10px_18px_rgb(0_0_0/0.28)] ${noteStyles[index % noteStyles.length]}`}
          >
            {note}
          </li>
        ))}
      </ul>
      <h2
        id="desk-sticky-notes"
        className="mt-2 text-center text-[13px] font-medium text-on-wood"
      >
        {t("objects.stickyNotes")}
      </h2>
    </section>
  );
}
