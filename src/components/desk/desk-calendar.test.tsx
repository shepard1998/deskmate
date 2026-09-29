import { screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { renderWithIntl } from "@/i18n/test-utils";

import { DeskCalendar } from "./desk-calendar";

// 02:30 UTC on September 30 is still September 29 in Bogotá.
const now = new Date("2026-09-30T02:30:00Z");

test("shows today in the user's time zone", () => {
  renderWithIntl(<DeskCalendar now={now} timeZone="America/Bogota" />);

  expect(
    screen.getByRole("img", { name: "Tuesday, September 29, 2026" }),
  ).toHaveTextContent("Sep29Tuesday");
  expect(
    screen.getByRole("heading", { name: "Desk calendar" }),
  ).toBeInTheDocument();
});

test("uses the next day in a time zone that has passed midnight", () => {
  renderWithIntl(<DeskCalendar now={now} timeZone="Europe/Madrid" />);

  expect(
    screen.getByRole("img", { name: "Wednesday, September 30, 2026" }),
  ).toBeInTheDocument();
});

test("is localized into Spanish", () => {
  renderWithIntl(<DeskCalendar now={now} timeZone="America/Bogota" />, "es");

  expect(
    screen.getByRole("img", { name: "martes, 29 de septiembre de 2026" }),
  ).toHaveTextContent("29martes");
  expect(
    screen.getByRole("heading", { name: "Calendario de mesa" }),
  ).toBeInTheDocument();
});
