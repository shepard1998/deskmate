"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";

import { locales } from "@/lib/domain/locale";
import {
  DISPLAY_NAME_MAX_LENGTH,
  reducedMotionModes,
  settingRanges,
  themeModes,
  type Settings,
  type SettingsFieldError,
} from "@/lib/domain/profile";
import { saveSettings } from "@/lib/server/settings-actions";
import { initialSettingsFormState } from "@/lib/settings-form-state";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
const inputClass = `rounded-md border border-neutral-500 bg-white px-3 py-2 text-neutral-900 aria-invalid:border-red-700 ${focusRing}`;

export type SettingsFormValues = Omit<Settings, "timezone"> & {
  timezone: string | null;
};

type SettingsFormProps = {
  values: SettingsFormValues;
  /** IANA time zones to offer, sorted. */
  timeZones: string[];
};

export function SettingsForm({ values, timeZones }: SettingsFormProps) {
  const t = useTranslations("Settings");
  const tLanguage = useTranslations("LanguageSwitcher");
  const format = useFormatter();
  const [state, formAction] = useActionState(
    saveSettings,
    initialSettingsFormState,
  );
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const idPrefix = useId();
  const id = (name: string) => `${idPrefix}-${name}`;

  // Profiles start without a time zone until the browser reports one; until
  // the user picks one, offer the browser's zone instead of an empty field.
  const browserTimeZone = useSyncExternalStore(
    subscribeToNothing,
    readBrowserTimeZone,
    () => null,
  );
  const [chosenTimezone, setTimezone] = useState(values.timezone);
  const timezone = chosenTimezone ?? browserTimeZone ?? "";
  const [soundVolume, setSoundVolume] = useState(values.soundVolume);
  const [streakThreshold, setStreakThreshold] = useState(
    values.streakThreshold,
  );

  // After an invalid submit, focus the first field that needs attention.
  useEffect(() => {
    if (state.status === "invalid") {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  const zoneOptions =
    timezone && !timeZones.includes(timezone)
      ? [timezone, ...timeZones]
      : timeZones;

  function errorFor(name: keyof Settings): string | null {
    const error: SettingsFieldError | undefined = state.errors[name];
    if (!error) return null;
    if (error === "outOfRange" && name in settingRanges) {
      return t("errors.outOfRange", {
        ...settingRanges[name as keyof typeof settingRanges],
      });
    }
    return t(`errors.${error}`);
  }

  /** Props that tie a control to its hint and error message. */
  function describe(name: keyof Settings, hasHint = false) {
    const error = errorFor(name);
    const describedBy = [
      hasHint ? id(`${name}-hint`) : null,
      error ? id(`${name}-error`) : null,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy || undefined,
    } as const;
  }

  // Render helpers, not components: components declared inside a component
  // remount on every render and would lose what the user typed.
  function fieldError(name: keyof Settings) {
    const error = errorFor(name);
    return error ? (
      <p id={id(`${name}-error`)} className="text-sm text-red-800">
        {error}
      </p>
    ) : null;
  }

  function hint(name: string, children: ReactNode) {
    return (
      <p id={id(`${name}-hint`)} className="text-sm text-neutral-700">
        {children}
      </p>
    );
  }

  function numberField(name: keyof typeof settingRanges) {
    const { min, max } = settingRanges[name];
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id(name)} className="font-medium">
          {t(name)}
        </label>
        <input
          id={id(name)}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          defaultValue={values[name]}
          className={`${inputClass} w-28`}
          {...describe(name)}
        />
        {fieldError(name)}
      </div>
    );
  }

  const statusMessage =
    state.status === "idle" ? "" : t(`status.${state.status}`);

  return (
    <form
      ref={formRef}
      noValidate
      // Submitting manually keeps the typed values after an invalid submit;
      // a form `action` would reset them.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="flex flex-col gap-8"
    >
      <Section title={t("sections.profile")}>
        <div className="flex flex-col gap-1">
          <label htmlFor={id("displayName")} className="font-medium">
            {t("displayName")}
          </label>
          <input
            id={id("displayName")}
            name="displayName"
            type="text"
            autoComplete="nickname"
            required
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            defaultValue={values.displayName}
            className={inputClass}
            {...describe("displayName", true)}
          />
          {hint(
            "displayName",
            t("displayNameHint", { max: DISPLAY_NAME_MAX_LENGTH }),
          )}
          {fieldError("displayName")}
        </div>
      </Section>

      <Section title={t("sections.languageAndTime")}>
        <div className="flex flex-col gap-1">
          <label htmlFor={id("locale")} className="font-medium">
            {t("language")}
          </label>
          <select
            id={id("locale")}
            name="locale"
            defaultValue={values.locale}
            className={`${inputClass} w-fit`}
            {...describe("locale")}
          >
            {locales.map((locale) => (
              <option key={locale} value={locale} lang={locale}>
                {tLanguage(locale)}
              </option>
            ))}
          </select>
          {fieldError("locale")}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={id("timezone")} className="font-medium">
            {t("timezone")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              id={id("timezone")}
              name="timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className={`${inputClass} max-w-full`}
              {...describe("timezone", true)}
            >
              {timezone === "" ? (
                <option value="">{t("timezonePlaceholder")}</option>
              ) : null}
              {zoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setTimezone(readBrowserTimeZone())}
              className={`rounded-md border border-neutral-900 px-3 py-2 text-sm font-medium hover:bg-neutral-100 ${focusRing}`}
            >
              {t("useBrowserTimezone")}
            </button>
          </div>
          {hint("timezone", t("timezoneHint"))}
          {fieldError("timezone")}
        </div>
      </Section>

      <Section title={t("sections.appearance")} comingSoon={t("comingSoon")}>
        <RadioGroup
          legend={t("theme.legend")}
          name="themeMode"
          options={themeModes}
          defaultValue={values.themeMode}
          label={(mode) => t(`theme.${mode}`)}
          error={errorFor("themeMode")}
        />
      </Section>

      <Section title={t("sections.sound")} comingSoon={t("comingSoon")}>
        <Checkbox
          id={id("soundEnabled")}
          name="soundEnabled"
          label={t("soundEnabled")}
          defaultChecked={values.soundEnabled}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={id("soundVolume")} className="font-medium">
            {t("soundVolume")}
          </label>
          <div className="flex items-center gap-3">
            <input
              id={id("soundVolume")}
              name="soundVolume"
              type="range"
              {...settingRanges.soundVolume}
              step={5}
              value={soundVolume}
              onChange={(event) => setSoundVolume(Number(event.target.value))}
              aria-valuetext={format.number(soundVolume / 100, {
                style: "percent",
              })}
              className={`w-48 accent-neutral-900 ${focusRing}`}
              {...describe("soundVolume")}
            />
            <output
              // The slider already exposes this value through aria-valuetext.
              aria-hidden="true"
              htmlFor={id("soundVolume")}
              className="tabular-nums"
            >
              {format.number(soundVolume / 100, { style: "percent" })}
            </output>
          </div>
          {fieldError("soundVolume")}
        </div>
      </Section>

      <Section title={t("sections.motion")} comingSoon={t("comingSoon")}>
        <RadioGroup
          legend={t("reducedMotion.legend")}
          name="reducedMotion"
          options={reducedMotionModes}
          defaultValue={values.reducedMotion}
          label={(mode) => t(`reducedMotion.${mode}`)}
          error={errorFor("reducedMotion")}
        />
      </Section>

      <Section title={t("sections.progress")} comingSoon={t("comingSoon")}>
        <div className="flex flex-col gap-1">
          <label htmlFor={id("streakThreshold")} className="font-medium">
            {t("streakThreshold")}
          </label>
          <div className="flex items-center gap-3">
            <input
              id={id("streakThreshold")}
              name="streakThreshold"
              type="range"
              {...settingRanges.streakThreshold}
              step={5}
              value={streakThreshold}
              onChange={(event) =>
                setStreakThreshold(Number(event.target.value))
              }
              aria-valuetext={format.number(streakThreshold / 100, {
                style: "percent",
              })}
              className={`w-48 accent-neutral-900 ${focusRing}`}
              {...describe("streakThreshold", true)}
            />
            <output
              // The slider already exposes this value through aria-valuetext.
              aria-hidden="true"
              htmlFor={id("streakThreshold")}
              className="tabular-nums"
            >
              {format.number(streakThreshold / 100, { style: "percent" })}
            </output>
          </div>
          {hint("streakThreshold", t("streakThresholdHint"))}
          {fieldError("streakThreshold")}
        </div>
      </Section>

      <Section title={t("sections.pomodoro")} comingSoon={t("comingSoon")}>
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("pomodoroFocusMinutes")}
          {numberField("pomodoroShortBreakMinutes")}
          {numberField("pomodoroLongBreakMinutes")}
          {numberField("pomodoroSessionsBeforeLongBreak")}
        </div>
      </Section>

      <Section title={t("sections.morningNote")} comingSoon={t("comingSoon")}>
        <Checkbox
          id={id("aiNoteEnabled")}
          name="aiNoteEnabled"
          label={t("aiNoteEnabled")}
          hint={t("aiNoteHint")}
          defaultChecked={values.aiNoteEnabled}
        />
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          aria-disabled={isPending}
          onClick={(event) => {
            if (isPending) event.preventDefault();
          }}
          className={`rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 aria-disabled:opacity-70 ${focusRing}`}
        >
          {isPending ? t("saving") : t("save")}
        </button>
        <p
          role="status"
          key={state.submission}
          className={
            state.status === "saved" ? "text-green-800" : "text-red-800"
          }
        >
          {statusMessage}
        </p>
      </div>
    </form>
  );
}

function readBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** The browser's time zone does not change while the page is open. */
function subscribeToNothing(): () => void {
  return () => {};
}

function Section({
  title,
  comingSoon,
  children,
}: {
  title: string;
  comingSoon?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-neutral-300 pt-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {comingSoon ? (
          <p className="text-sm text-neutral-700">{comingSoon}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Checkbox({
  id,
  name,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`mt-1 size-4 accent-neutral-900 ${focusRing}`}
      />
      <div>
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="text-sm text-neutral-700">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RadioGroup<T extends string>({
  legend,
  name,
  options,
  defaultValue,
  label,
  error,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  defaultValue: T;
  label: (option: T) => string;
  error: string | null;
}) {
  const groupId = useId();
  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${groupId}-error` : undefined}
      className="flex flex-col gap-2"
    >
      <legend className="mb-1 font-medium">{legend}</legend>
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="radio"
            name={name}
            value={option}
            defaultChecked={option === defaultValue}
            className={`size-4 accent-neutral-900 ${focusRing}`}
          />
          {label(option)}
        </label>
      ))}
      {error ? (
        <p id={`${groupId}-error`} className="text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
