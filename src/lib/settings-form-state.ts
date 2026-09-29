import type { SettingsErrors } from "@/lib/domain/profile";

/** Result of the save-settings Server Function. */
export type SettingsFormState = {
  status: "idle" | "saved" | "invalid" | "failed";
  errors: SettingsErrors;
  /** Increments on every submit so the status message is announced again. */
  submission: number;
};

export const initialSettingsFormState: SettingsFormState = {
  status: "idle",
  errors: {},
  submission: 0,
};
