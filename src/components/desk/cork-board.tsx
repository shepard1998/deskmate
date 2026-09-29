import { useTranslations } from "next-intl";

type SampleJob = { company: string; stage: string };

// Placeholder cards until F7 builds the job search board.
const cardStyles = [
  { card: "left-[5%] top-4 -rotate-4", pin: "bg-[#3b82c4]", stage: "" },
  {
    card: "left-[50%] top-2 rotate-3",
    pin: "bg-[#c2412d]",
    stage: "font-semibold text-[#9b2c1f]",
  },
  { card: "left-[26%] top-[98px] -rotate-1", pin: "bg-[#3f8f5a]", stage: "" },
];

export function CorkBoard() {
  const t = useTranslations("Desk");
  const jobs = t.raw("sample.jobs") as SampleJob[];

  return (
    <section
      aria-labelledby="desk-cork-board"
      className="flex w-full flex-col items-center"
    >
      <div className="cork relative h-[200px] w-full max-w-[300px] rounded-md border-[10px] border-[#7a5230] shadow-[0_14px_24px_rgb(0_0_0/0.35)]">
        <ul>
          {jobs.map((job, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <li
                key={job.company}
                className={`absolute w-[44%] min-w-[96px] bg-[#fdfbf5] px-2 pt-3 pb-1.5 shadow-[0_4px_8px_rgb(0_0_0/0.25)] ${style?.card}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full shadow-[0_2px_2px_rgb(0_0_0/0.4)] ${style?.pin}`}
                />
                <span className="block font-hand text-[calc(var(--hand-scale)*15px)] leading-tight text-ink">
                  {job.company}
                </span>
                <span
                  className={`block text-[11px] leading-tight text-ink-soft ${style?.stage}`}
                >
                  {job.stage}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <h2
        id="desk-cork-board"
        className="mt-3 text-[13px] font-medium text-on-wood"
      >
        {t("objects.corkBoard")}
      </h2>
    </section>
  );
}
