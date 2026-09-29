# Deskmate

[![CI](https://github.com/shepard1998/deskmate/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/shepard1998/deskmate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Your day, on paper. Your tools, on the keyboard.**

Deskmate is a daily-life management app for developers that looks and feels like a physical desk: paper sheets, handwritten notes, sticky notes, and a pencil, with light that follows your time of day. Underneath the analog surface sit the tools developers expect: keyboard shortcuts, a command palette, and GitHub integration.

> **Status: early development.** Accounts, the profile, and settings work. The interface is now being built screen by screen on sample data, and the backend comes after it (see the [roadmap](#roadmap)). Everything under [Features](#features) describes the planned product unless it is marked as available.

---

## Table of contents

- [The idea](#the-idea)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Engineering principles](#engineering-principles)
- [Contributing workflow](#contributing-workflow)
- [Roadmap](#roadmap)
- [License](#license)

---

## The idea

Most productivity apps look like spreadsheets. Deskmate starts from a different question: _what if planning your day felt like sitting down at a tidy desk?_

When your day starts, Deskmate greets you and hands you a paper sheet with your morning routine: have breakfast, make coffee, set up the workstation. As the day moves on, you flip to the sheet for the afternoon, evening, and night. You cross tasks out with a pencil stroke, stick notes on the desk, start a focus session from the top bar, and close the day with a short shutdown ritual.

It is built for developers first, night owls included. A day can start at 05:00, so work at 01:30 still counts as "yesterday".

## Features

### Daily flow

- **Morning greeting** on the first open of each day, with today's sheet, events, and follow-ups.
- **Routines per part of the day** (morning, afternoon, evening, night) that regenerate tasks every day, plus one-off tasks.
- **Logical day** with a configurable start hour, so late-night work belongs to the right day.
- **Shutdown ritual** to review the day, reflect, and carry pending tasks over to tomorrow.

### Objects on the desk

- **Your own desk**: choose the wood (walnut, oak, or ebony), the paper, and the handwriting.
- **Sticky notes** in four colors that you can drag around the desk.
- **Desk calendar** with meetings, appointments, and reminders.
- **Cork board** with a kanban job search tracker, follow-up dates, and an activity log.
- **Scene lighting** that follows your local time, with a light and dark theme toggle.
- **Pomodoro timer** in the top bar that survives page reloads and logs focus time.
- **Crumple to delete**, with an Undo toast.

### Progress

- A contribution-style **completion heatmap** for the last 12 months.
- **Streaks**, completion rate by part of the day, weekly focus time, and a weekly review.
- **Habits vs. commits**: your daily completion rate next to your GitHub contributions.

### Developer ergonomics

- **Command palette** (`Ctrl+K` / `Cmd+K`) for every action.
- **GitHub integration** (read-only): contributions, open pull requests, and review requests.
- **AI morning note** written by Claude from your tasks, events, and pull requests, with a deterministic fallback.

### Everywhere

- **Bilingual UI**: English and Spanish. The language comes from the user's choice, then the browser, then English, with no locale prefix in URLs.
- **Accessible**: keyboard navigation, visible focus, WCAG AA contrast, and a reduced-motion alternative for every animation.
- **Installable PWA** and a lightweight **desktop app** for Windows (Tauri).
- **Try the demo**: one click opens a fully seeded desk with months of history, no sign-up needed.

## Tech stack

| Area                    | Technology                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Framework               | [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/) (strict) |
| Styling                 | [Tailwind CSS](https://tailwindcss.com/) 4                                                                                             |
| Backend, database, auth | [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security, `pg_cron`, Edge Functions)                                      |
| Internationalization    | [next-intl](https://next-intl.dev/) (`en`, `es`)                                                                                       |
| Animation and sound     | [Motion](https://motion.dev/), Howler.js or use-sound                                                                                  |
| Charts and dates        | [Recharts](https://recharts.org/), [date-fns](https://date-fns.org/) and date-fns-tz                                                   |
| Testing                 | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/)                  |
| Tooling                 | [pnpm](https://pnpm.io/), ESLint, Prettier, GitHub Actions                                                                             |
| Hosting                 | [Vercel](https://vercel.com/)                                                                                                          |
| Desktop                 | [Tauri](https://tauri.app/) v2                                                                                                         |
| AI                      | [Claude API](https://docs.anthropic.com/) (server-side only)                                                                           |

Parts of the stack are added as the matching roadmap goal is built. The foundation today is Next.js, TypeScript, Tailwind, and the testing toolchain.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 24 or later (see `.nvmrc`)
- [pnpm](https://pnpm.io/) 10 (the exact version is pinned in `package.json` and can be enabled with `corepack enable`)
- [Google Chrome](https://www.google.com/chrome/), used by the end-to-end tests
- A [Supabase](https://supabase.com/) project (the free plan is enough). The Supabase CLI is installed by `pnpm install`.

### Install and run

```bash
git clone https://github.com/shepard1998/deskmate.git
cd deskmate
pnpm install
```

Connect the repository to your Supabase project and apply the migrations:

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <your-project-ref>
pnpm db:push
```

Copy `.env.example` to `.env.local` and fill in the project URL, the publishable key, and (for the end-to-end tests) the secret key.

Auth settings live in `supabase/config.toml`. To enable GitHub sign-in, create a [GitHub OAuth App](https://github.com/settings/developers) with the callback URL `https://<your-project-ref>.supabase.co/auth/v1/callback`, put its client ID in `[auth.external.github]` and its client secret in `.env.local`, then push the settings (review them first with `supabase config diff`):

```bash
set -a && . ./.env.local && set +a
pnpm exec supabase config push
```

Start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Keeping the free-tier database awake

Free Supabase projects pause after 7 days without activity. The [keep-alive workflow](.github/workflows/keepalive.yml) calls a tiny database function every 3 days. It needs two repository secrets, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. GitHub disables scheduled workflows after 60 days without repository activity; re-enable it from the Actions tab if that happens.

## Scripts

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Starts the development server                             |
| `pnpm build`        | Creates a production build                                |
| `pnpm start`        | Serves the production build                               |
| `pnpm typecheck`    | Generates Next.js route types and type-checks the project |
| `pnpm lint`         | Lints the code with ESLint                                |
| `pnpm format`       | Formats the code with Prettier                            |
| `pnpm format:check` | Checks formatting without writing changes                 |
| `pnpm test`         | Runs unit and component tests once                        |
| `pnpm test:watch`   | Runs unit and component tests in watch mode               |
| `pnpm test:e2e`     | Builds the app and runs end-to-end tests in Chrome        |
| `pnpm db:push`      | Applies pending migrations to the linked Supabase project |
| `pnpm db:types`     | Generates TypeScript types from the linked project schema |

### Quality gate

Every change must pass the full gate before it is merged:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build
```

[GitHub Actions](.github/workflows/ci.yml) runs the same gate, plus a formatting check, on a clean Linux machine for every push and pull request to `develop` and `main`.

## Testing

| Layer      | Tool                           | Location            | Covers                                               |
| ---------- | ------------------------------ | ------------------- | ---------------------------------------------------- |
| Unit       | Vitest                         | `src/**/*.test.ts`  | Business rules as pure functions in `src/lib/domain` |
| Component  | Vitest, Testing Library, jsdom | `src/**/*.test.tsx` | Rendering and interaction of React components        |
| End-to-end | Playwright (Chrome)            | `e2e/*.spec.ts`     | Real user flows against the production build         |
| Security   | Playwright (API only)          | `e2e/rls/*.spec.ts` | Row Level Security and column privileges per table   |

End-to-end tests run against the Supabase project. Every user they create has an `@deskmate.test` email and is deleted when the run ends; leftovers from interrupted runs are removed an hour later by the next run.

End-to-end tests start the production server automatically. When a server is already running on port 3000 locally, Playwright reuses it, so stop `pnpm dev` first to test the production build.

## Project structure

```text
.
├── e2e/                  # Playwright end-to-end tests
├── messages/             # UI strings: en.json and es.json (keys must match)
├── src/
│   ├── app/              # Next.js App Router: routes, layouts, and pages
│   ├── components/       # Reusable UI components
│   ├── i18n/             # next-intl request config and the locale Server Function
│   └── lib/
│       ├── domain/       # Business rules as pure, unit-tested functions
│       ├── server/       # Server-only code (database access, external APIs)
│       ├── supabase/     # Browser Supabase client
│       ├── database.types.ts  # Generated database types (pnpm db:types)
│       └── env.ts        # Validated environment variables
├── supabase/             # Supabase config, migrations, and seed data
├── playwright.config.ts
└── vitest.config.mts
```

## Engineering principles

- **Business rules are pure functions.** Logic such as the logical day, streaks, and job board transitions lives in `src/lib/domain` and is covered by unit tests. Components only render.
- **Security by default.** Every table has Row Level Security. Tokens and API keys stay on the server and never reach the client.
- **Time is hard, so it is explicit.** Timestamps are stored in UTC. Anything day-based is computed in the user's timezone.
- **Accessibility is part of done.** Keyboard access, visible focus, AA contrast, and reduced-motion fallbacks are required for every feature.
- **No hardcoded copy.** Every user-facing string lives in the English and Spanish translation files.
- **A demo that is always complete.** Each feature that adds visible data also updates the demo seed.

## Contributing workflow

This is a personal portfolio project, but it follows a team-grade workflow:

- **Branches:** `main` is production, `develop` is the integration branch, and work happens on `feature/<goal-id>-<short-name>` branches that merge back into `develop` with `--no-ff`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(routines): add weekday recurrence`.
- **Releases:** `develop` is merged into `main` for each release, tagged with a semantic version.

## Roadmap

The interface is built first, on sample data kept in the browser, so every screen can be designed and reviewed end to end. The backend then replaces the sample data one area at a time, without changing the interface.

| Phase | Scope                                                                                                                           | Status      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0     | Foundations, CI, Supabase, i18n, email and GitHub sign-in, profile and settings                                                 | Done        |
| 1     | Interface on sample data: desk scene, daily flow, desk tools, calendar, stats, GitHub widgets, job board, AI note, landing, PWA | In progress |
| 2     | Backend integration: tables with Row Level Security, sync, GitHub, the Claude API, and the demo mode                            | Planned     |
| 3     | Desktop app (Tauri), documentation, deploy, and the `v1.0.0` release                                                            | Planned     |

## License

Released under the [MIT License](LICENSE).

---

Built by [Kevin Fernández](https://github.com/shepard1998).
