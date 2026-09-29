import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Globals are disabled, so Testing Library cannot register its cleanup automatically.
afterEach(() => {
  cleanup();
});
