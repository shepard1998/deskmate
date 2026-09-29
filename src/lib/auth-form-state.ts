import type { AuthErrorKey, CredentialErrors } from "@/lib/domain/auth";

/** State returned by the sign-in and sign-up Server Functions. */
export type AuthFormState = {
  /** Echoed back so the email field keeps its value after an error. */
  email: string;
  fieldErrors: CredentialErrors;
  formError: AuthErrorKey | null;
};

export const initialAuthFormState: AuthFormState = {
  email: "",
  fieldErrors: {},
  formError: null,
};
