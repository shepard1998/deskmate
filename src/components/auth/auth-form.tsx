"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useId, useRef } from "react";

import { initialAuthFormState } from "@/lib/auth-form-state";
import { PASSWORD_MIN_LENGTH, type AuthMode } from "@/lib/domain/auth";
import { signIn, signUp } from "@/lib/server/auth-actions";

const actions = { signIn, signUp };

const otherPage = {
  signIn: "/sign-up",
  signUp: "/sign-in",
} as const;

const inputClass =
  "w-full rounded-md border border-neutral-500 bg-white px-3 py-2 text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 aria-invalid:border-red-700";

type AuthFormProps = {
  mode: AuthMode;
  /** Internal path to return to after authenticating. */
  next?: string;
};

export function AuthForm({ mode, next }: AuthFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(
    actions[mode],
    initialAuthFormState,
  );
  const ids = {
    email: useId(),
    emailError: useId(),
    password: useId(),
    passwordHint: useId(),
    passwordError: useId(),
    formError: useId(),
  };
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { fieldErrors, formError } = state;

  // Moves focus to the first field that needs attention after a submit.
  useEffect(() => {
    if (state.fieldErrors.email) {
      emailRef.current?.focus();
    } else if (state.fieldErrors.password || state.formError) {
      passwordRef.current?.focus();
    }
  }, [state]);

  const passwordDescription = [
    mode === "signUp" ? ids.passwordHint : null,
    fieldErrors.password ? ids.passwordError : null,
    formError ? ids.formError : null,
  ]
    .filter(Boolean)
    .join(" ");

  const switchHref = next
    ? `${otherPage[mode]}?next=${encodeURIComponent(next)}`
    : otherPage[mode];

  return (
    <form
      action={formAction}
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        {t(`${mode}.title`)}
      </h1>

      {formError ? (
        <p
          id={ids.formError}
          role="alert"
          className="rounded-md border border-red-700 bg-red-50 px-3 py-2 text-red-800"
        >
          {t(`errors.${formError}`)}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.email} className="font-medium">
          {t("email")}
        </label>
        <input
          ref={emailRef}
          id={ids.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? ids.emailError : undefined}
          className={inputClass}
        />
        {fieldErrors.email ? (
          <p id={ids.emailError} className="text-sm text-red-800">
            {t(`errors.${fieldErrors.email}`)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.password} className="font-medium">
          {t("password")}
        </label>
        <input
          ref={passwordRef}
          id={ids.password}
          name="password"
          type="password"
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
          required
          aria-invalid={fieldErrors.password ? true : undefined}
          aria-describedby={passwordDescription || undefined}
          className={inputClass}
        />
        {mode === "signUp" ? (
          <p id={ids.passwordHint} className="text-sm text-neutral-700">
            {t("passwordHint", { min: PASSWORD_MIN_LENGTH })}
          </p>
        ) : null}
        {fieldErrors.password ? (
          <p id={ids.passwordError} className="text-sm text-red-800">
            {t(`errors.${fieldErrors.password}`)}
          </p>
        ) : null}
      </div>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <button
        type="submit"
        aria-disabled={isPending}
        onClick={(event) => {
          // Ignore repeated submits without removing the button from focus.
          if (isPending) event.preventDefault();
        }}
        className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 aria-disabled:opacity-70"
      >
        {isPending ? t(`${mode}.submitting`) : t(`${mode}.submit`)}
      </button>

      <p className="text-sm text-neutral-700">
        {t(`${mode}.switchPrompt`)}{" "}
        <Link
          href={switchHref}
          className="font-medium text-blue-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t(`${mode}.switchLink`)}
        </Link>
      </p>
    </form>
  );
}
