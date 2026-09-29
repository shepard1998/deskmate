import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { renderWithIntl } from "@/i18n/test-utils";

import { SheetStack } from "./sheet-stack";

function renderSheets(locale: "en" | "es" = "en") {
  return renderWithIntl(
    <SheetStack
      currentPart="afternoon"
      dateLabel="Tuesday, September 29"
      displayName="Ada"
    />,
    locale,
  );
}

describe("SheetStack", () => {
  test("opens on the current day part and greets the user", () => {
    renderSheets();

    expect(screen.getByRole("tab", { name: "Afternoon" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Good afternoon, Ada" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tabpanel", { name: "Afternoon" }),
    ).toBeInTheDocument();
  });

  test("labels the tab list and keeps only the selected tab in the tab order", () => {
    renderSheets();

    expect(
      screen.getByRole("tablist", { name: "Parts of the day" }),
    ).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
      "-1",
    ]);
  });

  test("switches sheets with a click", async () => {
    const user = userEvent.setup();
    renderSheets();

    await user.click(screen.getByRole("tab", { name: "Evening" }));

    expect(screen.getByRole("tabpanel", { name: "Evening" })).toHaveTextContent(
      "Shutdown ritual",
    );
  });

  test("moves between tabs with the arrow keys, Home, and End", async () => {
    const user = userEvent.setup();
    renderSheets();

    screen.getByRole("tab", { name: "Afternoon" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Evening" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Evening" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Night" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Morning" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Night" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Morning" })).toHaveFocus();
  });

  test("announces done tasks to screen readers", () => {
    renderSheets();

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Lunch away from the screen(done)");
    expect(panel).toHaveTextContent("1 of 4 done");
  });

  test("is translated into Spanish", () => {
    renderSheets("es");

    expect(screen.getByRole("tab", { name: "Tarde" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Buenas tardes, Ada" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Cuando sea",
    );
  });
});
