# Waitlist Overview — Implementation Plan

Source design: `.claude/skill-workspace/superpowers/brainstorming/2026-09-08-waitlist-overview-design.md`
Branch: `feature/waitlist-overview`
Date: 2026-09-08
`PLAN_BASE_COMMIT` = `a4fa27b`

> **Execution method**
> - `[SKILL: name]` → dispatch the `skill-executor` agent with the skill **name only**. Never paste skill content, never implement it yourself.
> - `[NO SKILL]` → execute directly in the main agent.
> - One step per dispatch. Verify, review, commit, then move on. Never bundle steps.
> - Executor returns: `DONE` proceed · `DONE_WITH_CONCERNS` show user · `BLOCKED` stop everything, show report, wait · `NEEDS_CONTEXT` relay questions verbatim.

---

## Execution rules (embedded — do not rely on external files)

1. **AGENTS.md gate.** This is Next.js 16.3.4, not the Next.js in your training data. Before writing code for any step touching routing, `searchParams`, layouts, metadata, or error/loading boundaries, read the relevant guide under `node_modules/next/dist/docs/01-app/`. The `next-best-practices` skill is a secondary reference (`user-invocable: false` — read it, do not dispatch it).
2. **No code comments.** A write-time hook rejects them. Explain simplifications in the commit message or the step report.
3. **User coding preferences** (apply to every step): immutability by default (`readonly`, no mutation); prefer abstraction and reuse over duplication; maximise native JS (`flatMap`, `Object.entries`, `filter`, `at`); full typing with generics where they earn their keep.
4. **Verify after every step.** A step is not done until its verify line passes.
5. **Commit per step.** Format matches repo history: `<Area> - <description>` (e.g. `Data - Add waitlist list indexes`). Prefixes in use: `Data`, `UI`, `Docs`, `Chore`.
6. **BLOCKED means stop.** Do not improvise past a blocker.
7. Work stays on `feature/waitlist-overview`.

## Global verification commands

```bash
npx next build                  # includes tsc; the real type gate
npx eslint .
node --test "lib/**/*.test.ts"  # quoted glob — see Verified Fact 5
```

---

## Verified facts (probed in this repo — do not re-derive, do not contradict)

Each was executed, not reasoned about.

| # | Fact | Evidence |
|---|---|---|
| 1 | Baseline `next build` fails on **exactly one** error: `header.tsx(1,28) TS2307` for `@/lib/types/ui/breadcrumb`. Nothing else is broken. | ran `npx next build` |
| 2 | `Header` has **one** call site: `components/templates/basic-page-template.tsx:27`, passing `breadcrumbs={[]}`. `onSearchSubmit` and `searchValue` are passed by **nobody**. The body renders the literal string `breadcrumbs`. | grep, all call sites |
| 3 | `node --test` needs an **explicit `.ts` extension** on relative imports, and **cannot resolve `@/` aliases** (`ERR_MODULE_NOT_FOUND`). Extensionless also fails. | ran both probes |
| 4 | tsc rejects `.ts` import extensions with **TS5097** unless `allowImportingTsExtensions: true`. Adding it is legal here (`noEmit: true`) and leaves `next build` green. | ran tsc + next build with the flag |
| 5 | `node --test "lib/**/*.test.ts"` (quoted glob) works. Directory mode (`node --test lib/`) picks up non-test files and fails. | ran both |
| 6 | `and()` from `drizzle-orm` with **zero arguments returns `undefined`** — exactly the `buildWhere` "no filters" contract. `drizzle-orm` imports fine under `node --test`. | ran assertion |
| 7 | The `ConditionMap<TParsers>` mapped-type split **compiles** against this tsconfig, and its drift guards are **live**: missing key → `TS2741`; a **narrower** handler param → `TS2322`. The guard is **one-directional**: a *wider* param (`(value: string) => SQL` for an enum filter) is legal under `strictFunctionTypes` contravariance and is only caught downstream by drizzle's column-typed `eq`. Type every handler with the exact inferred value type. | compiled + mutation-tested |
| 8 | `ParserBuilder<never>` **fails** (`TS2344` + `TS2322`). The bound must be `GenericParserBuilder<any>`, imported from `nuqs/server`. | mutation-tested |
| 11 | Node's type stripping performs **no import elision**. A type-only export written as a value import is a runtime `SyntaxError` under `node --test` while `next build` stays green. `GenericParserBuilder` and `inferParserType` are type-only nuqs exports. **Every type import in `lib/lists/**` must be `import type`.** `isolatedModules` does not enforce this. | reproduced empirically |
| 12 | `nuqs` defaults `shallow: true`. A shallow write updates the URL **without notifying the server**, so the Server Component never re-runs and the feature is a silent no-op. | `nuqs/dist/debounce-Ynq26WfO.js` |
| 9 | nuqs 2.10.1 exports `nuqs/server` (`createLoader`, `createSerializer`, `inferParserType`, `GenericParserBuilder`, `parseAs*`) and `nuqs/adapters/next/app`. Currently imported **nowhere**. | package exports + grep |
| 10 | Migrations live at `lib/db/migrations/<timestamp>_<name>/{migration.sql,snapshot.json}` (drizzle-kit 1.0-rc dir-per-migration). One migration exists. **No indexes exist on `waitlist_items`.** | `ls`, drizzle.config.ts |

### Two design corrections the probe forced

These override the letter of the spec. The spec's intent is preserved; its mechanics were wrong.

**A. The parser map must be split in two.**
`ConditionMap<typeof parsers>` over the *full* parser map demands a SQL condition for `page`, `sort` and `dir` — which are not filters. Making it `Partial<>` would destroy the drift guard that is the whole point. Verified working shape:

```ts
export const waitlistFilterParsers = { type, contactStatus, planningStatus, q, from, to };
export const waitlistListParsers = { ...waitlistFilterParsers, sort, dir, page };
export type WaitlistParams = inferParserType<typeof waitlistListParsers>;
```
`ConditionMap<typeof waitlistFilterParsers>` stays exact; the loader/serializer use `waitlistListParsers`.

**B. `buildWhere` must iterate the condition keys, not the value keys.**
The spec says "`Object.entries` erases key types". True, but iterating *values* means hitting `page`/`sort`/`dir` and calling `conditions[key]` where nothing exists — a runtime crash. Iterate `Object.keys(conditions)` and index into values. Verified compiling signature:

```ts
function buildWhere<TParsers extends Record<string, GenericParserBuilder<any>>>(
  conditions: ConditionMap<TParsers>,
  values: Partial<Record<keyof TParsers, unknown>>,
): SQL | undefined
```
The single contained `as never` stays, on the value passed into the handler.

### Sort-whitelist direction conflict (spec vs. bundle split)

The spec says `defineSort` "derives the URL whitelist from the column map". It cannot: the column map imports Drizzle, and `search-params.ts` is imported by client components and must stay Drizzle-free (the spec's own dividing line).

Resolution, same guarantee, correct direction: declare the sort keys as a `const` tuple in `search-params.ts` (Drizzle-free), and type the Drizzle column map as `Record<WaitlistSortKey, PgColumn>`. A missing or misspelled column is still a compile error — the drift guard survives, it just points the other way.

### Schema realities that contradict assumptions

| Finding | Consequence |
|---|---|
| `waitlist_items.created_at` is **nullable** (`timestamp().defaultNow()`, no `.notNull()`) | It is the default sort column. Postgres puts NULLs **first** in `DESC`. Also makes `WaitlistRow.registeredOn` `Date \| null`. See Step 6 decision. |
| `persons.dob` is `date()` → Drizzle returns **`string`** (`YYYY-MM-DD`), not `Date` | The cell renderer must not call Date methods on it. ISO strings sort chronologically, so sorting is fine as-is. |
| `waitlist_items.intake_at`, `intake_by`, `persons.dob/tel/email` all nullable | Every one of these columns needs a null branch in its renderer. |
| `registrations.support_need` is `text().notNull()` | Free text, can be long — the column needs truncation, not a fixed width. |
| `lib/db/queries/waitlist-items.ts` starts with `"use server"` | **Every export becomes a callable server-action endpoint.** See Step 7. |
| `proxy.ts` runs `clerkMiddleware()` with **no** `auth.protect()`; gating is render-level `<Show when="signed-in">` in `app/layout.tsx` | A new async Server Component **will execute and hit the DB for signed-out visitors**. See Step 14. |
| Enum values | `waitlist_type`: `diagnostics`, `psychological_support`, `child_psychiatric_support` · `contact_status`: `not_contacted`, `contacted`, `awaiting_info` · `planning_status`: `not_planned`, `planned`, `on_hold`, `no_longer_needed` |

---

## Skill catalog — matching result

The installed `generate-*` skills target a **different stack**: SWR, axios, TanStack Table, `next-intl`, `utilities/api/`, `useListManager`, `components/molecules/table/cell/`. This repo has none of those, and the spec explicitly forbids client-side fetching, which those skills mandate. Using them would import a foreign architecture.

| Skill | Verdict |
|---|---|
| `generate-overview-page`, `generate-list-hook`, `generate-list-manager`, `generate-table-column-definitions`, `generate-response-types`, `generate-crud-pages` | **NO MATCH** — SWR/axios/TanStack client-fetch stack |
| `add-translations` | **NO MATCH** — `next-intl`; this repo uses plain `lib/i18n/*-labels.ts` maps |
| `next-best-practices` | Reference only (`user-invocable: false`) — read, do not dispatch |
| `frontend-expert` | **MATCH** on the two visual steps (10, 12) |
| `phpro-code-review` | Review gates |

Net: the plan is almost entirely `[NO SKILL]`. That is the correct outcome, not a gap.

Per-step reviews: **ON** — `phpro-code-review --fast --fix --staged` on logic-bearing steps only (marked below). Mechanical steps skip it.

---

## Dependency graph

```
Step 0: Commit pending Next 16.3.4 bump (clean baseline)
  └ Step 1: Fix header import → FIRST GREEN BUILD
      ├ Step 2: tsconfig test flag + lib/lists/pagination.ts + tests
      │   └ Step 3: lib/lists/types.ts + filters.ts (buildWhere, defineSort, escapeLike) + tests
      │       ├ Step 4: waitlist-items/search-params.ts (parser maps, Drizzle-free)
      │       │   └ Step 5: waitlist-items/conditions.ts (ConditionMap + sort columns)
      │       │       └ Step 7: WaitlistRow + findWaitlistItems
      │       └ Step 6: Migration — indexes (+ created_at NOT NULL decision)
      │           └ Step 7
      └ Step 8: NuqsAdapter in app/layout.tsx
          ├ Step 9:  sortable-header atom + pagination component (Link-based)   also needs 2, 4
          ├ Step 10: data-table.tsx generic organism        [frontend-expert]   also needs 3
          │   └ Step 11: waitlist columns.tsx                                   also needs 7
          ├ Step 12: list-filters.tsx client controls        [frontend-expert]  also needs 4
          └ Step 13: header search (debounced, bound to q)                      also needs 4
              └ Step 14: Page assembly (server page + auth guard + filterCount + client toggle)
                  └ Step 15: error.tsx + loading.tsx
                      └ Step 16: Final full review
```

---

# Steps

### Step 0 — Commit the pending Next.js bump `[NO SKILL]`

The working tree is **dirty before any of this work starts**: `package.json` + `package-lock.json` carry an uncommitted `next` / `eslint-config-next` `16.2.12 → 16.3.4` bump and a dropped `brace-expansion` override. Plan steps must not smuggle this into an unrelated commit.

Confirm with the user that the bump is intended, then commit it alone. If it is not intended, `git checkout` it instead.

**→ verify:** `git status --porcelain -- . ':!.claude'` is empty. (Plain `git status --porcelain` can never be empty — the plan and spec documents live under `.claude/`.)
**Commit:** `Chore - Bump Next.js to 16.3.4`

---

### Step 1 — Fix the broken header import (first green build) `[NO SKILL]`

`components/organisms/ui/header.tsx:1` imports `@/lib/types/ui/breadcrumb`, which does not exist. This is the only thing failing the build (Verified Fact 1).

Do **not** invent a `Breadcrumb` type. Verified Fact 2: the prop has one call site passing `[]`, and the body renders the literal string `"breadcrumbs"` — the type would have zero real consumers. Delete the import and the `breadcrumbs` prop from `HeaderProps`, and drop `breadcrumbs={[]}` at `basic-page-template.tsx:27`.

Leave `onSearchSubmit` / `searchValue` alone for now — they are dead, but Step 13 rewrites that surface, and touching them here would be a change that does not trace to this step.

**→ verify:** `npx next build` **succeeds** — the first green build in this repo. `npx eslint .` clean.
**Commit:** `UI - Remove unused breadcrumbs prop and fix broken header import`

---

### Step 2 — Test infrastructure + `lib/lists/pagination.ts` `[NO SKILL]`

Two things, one commit, because the tsconfig flag is dead config without a test to justify it.

1. Add `"allowImportingTsExtensions": true` to `tsconfig.json` (Verified Fact 4 — required, legal, build stays green).
2. Add `"test": "node --test \"lib/**/*.test.ts\""` to `package.json` scripts (Verified Fact 5 — the quoted glob; directory mode does not work).
3. Write `lib/lists/pagination.ts`: `toOffset`, `toPageCount`, `toPageWindow`. Pure, zero imports. Page size fixed at 25 — export it as a named const, do not scatter the literal.
4. Write `lib/lists/pagination.test.ts` importing `./pagination.ts` **with the explicit extension** (Verified Fact 3).

**`toOffset` must clamp `page` to `>= 1`.** `?page=0` and `?page=-5` parse cleanly through `parseAsInteger.withDefault(1)`, and an unclamped `toOffset(0)` yields `-25` — Postgres rejects a negative `OFFSET` and the request dies in the error boundary. `toOffset` is the single choke point every caller routes through, so the clamp belongs there and nowhere else.

Cover, per the spec's Testing section: zero results, exact multiples, partial last page, clamping past the end (`?page=99` clamps to the last page), and **the lower bound — `page=0` and `page=-5` both yield offset 0**.

**→ verify:** `npm test` passes · `npx next build` green · `npx eslint .` clean.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `Data - Add list pagination helpers and native test runner setup`

---

### Step 3 — `lib/lists/types.ts` + `lib/lists/filters.ts` `[NO SKILL]`

The generic, schema-independent core.

`types.ts` — types only: `ColumnDef<TRow, TSortKey>`, `ListResult<TRow>`, `SortDirection`, and `ConditionMap<TParsers>` exactly as in Verified Fact 7, with the bound `GenericParserBuilder<any>` from `nuqs/server` (Verified Fact 8 — `ParserBuilder<never>` is a compile error, do not "fix" it to that).

`filters.ts`:
- `buildWhere` — the signature in **Design correction B**. Iterate `Object.keys(conditions)`. Skip `null`, `undefined`, and `""` (a `withDefault("")` parser never yields null, so the empty check is load-bearing, not defensive padding).
- `defineSort(columns, fallback, tiebreaker)` → returns `toOrderBy(key, dir)`. Columns typed `Record<TSortKey, PgColumn>` per the **sort-whitelist resolution** above.
- `escapeLikePattern(value)` — escapes `%`, `_` and the escape character itself before `ILIKE` interpolation.

**Every type import in this directory must be `import type`** (Verified Fact 11). `GenericParserBuilder` and `inferParserType` are type-only nuqs exports; importing them as values compiles fine and throws `SyntaxError` the moment `npm test` runs. If that fires, the fix is the `import type` keyword — never deleting the type.

**`escapeLikePattern` must live here, not in `conditions.ts`.** The spec's Testing section requires it under test, and `conditions.ts` imports `@/lib/db/schemas/*`, which `node --test` cannot resolve (Verified Fact 3). Keep `filters.ts` free of every `@/` import — `drizzle-orm` bare imports are fine and resolve correctly.

`filters.test.ts` covers: no filters → `undefined` (Verified Fact 6 confirms `and()` returns `undefined`); one filter → one condition; null/undefined/empty skipped; multiple combine; and the escaper leaving no live wildcards.

**→ verify:** `npm test` passes · `npx next build` green · `npx eslint .` clean.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `Data - Add generic list filter, sort and where-builder core`

---

### Step 4 — `lib/lists/waitlist-items/search-params.ts` `[NO SKILL]`

The shared client/server contract. **This file must not import Drizzle, `@/lib/db/*`, or anything that transitively does** — it ships to the browser.

Build both maps per **Design correction A**: `waitlistFilterParsers` (type, contactStatus, planningStatus, q, from, to) and `waitlistListParsers` (spread + sort, dir, page). Export `WaitlistParams` via `inferParserType`, plus `loadWaitlistParams` (`createLoader`) and `serializeWaitlistParams` (`createSerializer`).

Declare the sort-key tuple here as `as const` — it is the source of the URL whitelist. Defaults belong on the assembled map (`withDefault`), never inside a `FilterDef`: `sort` → `createdAt`, `dir` → `desc`, `page` → `1`, `q` → `""`. Enum parsers use `parseAsStringLiteral` over the tuples, so unknown values parse to `null` and the filter drops out rather than erroring.

**Every parser in `waitlistListParsers` carries `.withOptions({ shallow: false })`** (Verified Fact 12). nuqs defaults to `shallow: true`, which updates the URL without notifying the server — the Server Component never re-runs and the entire feature silently does nothing. This is the single highest-risk line in the plan.

Also export the control descriptors the generic filter UI renders from (discriminated union: select / text / date-range), so Step 12 renders by discriminant instead of hardcoding controls. Dutch labels come from `lib/i18n/` — `waitlist-type-labels.ts` exists; contact-status and planning-status label maps do not and are added here following that exact file shape.

**→ verify:** `npx next build` green · `npx eslint .` clean · confirm no Drizzle import: `grep -rn "drizzle\|@/lib/db" lib/lists/waitlist-items/search-params.ts` returns nothing.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `Data - Add waitlist list search params and filter descriptors`

---

### Step 5 — `lib/lists/waitlist-items/conditions.ts` `[NO SKILL]`

Server-only. Imports Drizzle freely.

`waitlistConditions: ConditionMap<typeof waitlistFilterParsers>` — one entry per filter. Enum filters use `eq`; `q` uses `ilike` over the **concatenated first and last name** so `"jan de"` matches, running the value through `escapeLikePattern` first.

**The date range is `gte(created_at, from)` and `lt(created_at, from + 1 day)` — `gte`/`lte` is wrong.** `parseAsIsoDate` yields **UTC midnight**, so `lte(created_at, to)` excludes every row created during the "to" day itself; picking `from == to == today` returns zero rows. Use an exclusive upper bound one day after `to`. The UTC-versus-Europe/Brussels boundary shift is accepted at this precision.

Handler params must be typed with the **exact** inferred value type, not a wider one — Verified Fact 7's guard does not catch widening.

Also export the sort column map typed `Record<WaitlistSortKey, PgColumn>` covering the spec's seven keys, with `desc(waitlistItemsTable.id)` as the tiebreaker.

The mapped type is the drift guard and it is live (Verified Fact 7): a missing key is `TS2741`, a wrong value type is `TS2322`. If either fires, the fix is the condition, never a cast or a `Partial<>`.

**→ verify:** `npx next build` green · `npx eslint .` clean.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `Data - Add waitlist filter conditions and sort column map`

---

### Step 6 — Migration: indexes `[NO SKILL]`

Add indexes to `lib/db/schemas/waitlist-items.ts` via Drizzle's table-level index builder, then generate the migration. Per spec: `created_at` (default sort), `contact_status`, `planning_status`, `waitlist_type`. Name search stays a sequential scan by design; `pg_trgm` is the documented upgrade path.

**DECISION MADE (user, 2026-09-08): add `.notNull()` to `waitlist_items.created_at` in this migration.** The column has `defaultNow()` and every insert path sets it, so no existing row can be null and the backfill is a no-op. This makes the default sort total and drops `registeredOn` to a non-nullable `Date` in the row type. Verify the generated SQL contains the `SET NOT NULL` alter and that it precedes the index creation.

Before generating, precheck that the `NOT NULL` tightening can apply: `SELECT count(*) FROM waitlist_items WHERE created_at IS NULL` must return 0, otherwise `SET NOT NULL` fails on the existing rows.

Run `npm run db:generate` (**not** `db:push` — this repo keeps versioned migrations in `lib/db/migrations/`). Review the generated SQL before committing; do not hand-edit the snapshot. **Then run `npm run db:migrate` to actually apply it** — generating alone leaves the indexes and the `NOT NULL` off the database, so the Drizzle types would claim non-null while the column stays nullable, and the Step 14 manual walk would run against a schema that disagrees with the code.

**→ verify:** a new `lib/db/migrations/<timestamp>_*/` directory exists with expected SQL · `npm run db:migrate` succeeds · the four indexes exist (`select indexname from pg_indexes where tablename = 'waitlist_items'`) and `created_at` is `NOT NULL` · `npx next build` green.
**Commit:** `Data - Add waitlist list indexes`

---

### Step 7 — `WaitlistRow` + `findWaitlistItems` `[NO SKILL]`

Add `WaitlistRow` to `lib/types/waitlist-items/index.ts`, following the file's existing `drizzle-orm/zod` idiom. It is a **join projection**, not a table select: name (from `persons`), waitlist type, contact status, planning status, registered-on, support need (from `registrations`), intake date, dob. Honour the nullability table above — notably `dob` is `string | null`, not a Date.

Add `findWaitlistItems` to `lib/db/queries/waitlist-items.ts`, joining `waitlist_items → registrations → persons`. The join is required for **both** the rows query and the count query, because name search filters on `persons`. Run rows and `COUNT(*)` through `Promise.all` against the same where clause. Return `{ rows, total, page, pageCount, sort }`.

**Handle the `"use server"` directive.** That file is `"use server"`, so every export becomes a client-callable server-action endpoint. `findWaitlistItems` is a read called directly from a Server Component and does not need to be one — exposing it publishes an unauthenticated query endpoint over patient data. Preferred fix: drop `"use server"` from the query module (the action layer in `lib/actions/waitlist-items.ts` already carries its own `"use server"` and is the real trust boundary). Verify `createWaitlistItemAction` still builds. If dropping it breaks something, report `DONE_WITH_CONCERNS` rather than leaving the read exported as an action.

**→ verify:** `npx next build` green · `npx eslint .` clean · confirm `createWaitlistItemAction` still type-checks.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `Data - Add waitlist row projection and paginated list query`

---

### Step 8 — `NuqsAdapter` in `app/layout.tsx` `[NO SKILL]`

Wrap the app in `NuqsAdapter` from `nuqs/adapters/next/app`. Placement matters: it must enclose the `children` that Steps 12–13 render client hooks inside, while leaving the existing `ClerkProvider` / `Show` / `AppToastProvider` structure intact.

Sequenced here deliberately — before the first `useQueryStates` consumer, so no step ships a component that compiles but throws at runtime.

**→ verify:** `npx next build` green · app renders at `/waitlist` with no console error.
**Commit:** `UI - Add nuqs adapter to root layout`

---

### Step 9 — `sortable-header` atom + `pagination` module `[NO SKILL]`

`components/atoms/table/sortable-header.tsx` — generic over the sort key. Renders a header cell that links to the toggled sort state. Toggling sort must **reset `page` to 1**.

`components/modules/pagination/pagination.tsx` — page numbers with jump-to-page, built from `toPageWindow`. Emits `<Link href>` built with `serializeWaitlistParams` so page links preserve active filters and **work without JS**. Hidden entirely when there are zero results.

Both are server-renderable. No `"use client"` — anything needing it here is a design smell, since these are links, not handlers.

**→ verify:** `npx next build` green · `npx eslint .` clean.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `UI - Add sortable header and pagination components`

---

### Step 10 — `data-table.tsx` generic organism `[SKILL: frontend-expert]`

`components/organisms/list/data-table.tsx`, generic over `<TRow, TSortKey>`, rendering `ColumnDef<TRow, TSortKey>[]`. Server component. Renders the empty state in the table body when there are no rows.

Generics stay inferred — no explicit type arguments at the call site in Step 14. Follow the repo's existing Tailwind v4 + Base UI conventions rather than introducing a new table idiom.

> Dispatch `skill-executor` with skill=`frontend-expert`. Pass the parameters and Verified Facts above — **not** an implementation sketch.

**→ verify:** `npx next build` green · `npx eslint .` clean.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `UI - Add generic data table organism`

---

### Step 11 — Waitlist columns `[NO SKILL]`

`components/organisms/list/waitlist-items/columns.tsx` — a `ColumnDef<WaitlistRow, WaitlistSortKey>[]`. This is the concrete half of the split; cell rendering is deliberately not generic.

Eight columns per spec: name, type, contact status, planning status, registered-on, support need, intake date, date of birth. Sortable flags must match the seven whitelisted sort keys — support need is displayed but **not** sortable.

Enum cells render Dutch labels from `lib/i18n/`. Every nullable column needs its null branch (see the nullability table): `dob` is a `YYYY-MM-DD` **string**, `intakeAt` is a nullable `Date`, `registeredOn` follows the Step 6 decision. Support need is unbounded free text — truncate it.

**→ verify:** `npx next build` green · `npx eslint .` clean.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `UI - Add waitlist table column definitions`

---

### Step 12 — `list-filters.tsx` client controls `[SKILL: frontend-expert]`

`components/organisms/list/list-filters.tsx` — `"use client"`, bound with `useQueryStates` over `waitlistListParsers`. Renders **by discriminant** from the Step 4 control descriptors, so a new filter is one descriptor entry and no UI change.

Any filter change must reset `page` to 1 (set it `null` so it drops from the URL rather than pinning `page=1`). Every write must carry `shallow: false` (Verified Fact 12) — it comes from the Step 4 parser options, so do not override it here. Reuse the existing form atoms in `components/atoms/form/` — `select.tsx`, `input.tsx`, `date-input.tsx` — do not introduce new control primitives.

> Dispatch `skill-executor` with skill=`frontend-expert`.

**→ verify:** `npx next build` green · `npx eslint .` clean · changing a filter updates the URL and the results; reload preserves state.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `UI - Add generic list filter controls`

---

### Step 13 — Wire the header search box `[NO SKILL]`

`components/organisms/ui/header.tsx` has a dead search input with its `value`/`onChange` commented out. Replace the dead props (`onSearchSubmit`, `searchValue` — passed by nobody, per Verified Fact 2) with a small debounced `"use client"` search component bound to the `q` param via `useQueryState`.

**Do not hand-roll the debounce.** nuqs exports `debounce(ms)` for its `limitUrlUpdates` option, which debounces the URL write while leaving the input responsive — exactly the requirement. Bind with `useQueryState('q', waitlistListParsers.q.withOptions({ shallow: false, limitUrlUpdates: debounce(300) }))`. A `useRef`/`useEffect` debounce is more code, is hostile to the React Compiler (`reactCompiler: true`), and reimplements an installed dependency.

Typing resets `page` to 1. Keep `showSearch` as the opt-in flag; `basic-page-template.tsx` already threads it.

**→ verify:** `npx next build` green · `npx eslint .` clean · typing filters results after the debounce; no lost keystrokes.
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `UI - Wire header search to the q query param`

---

### Step 14 — Page assembly `[NO SKILL]`

The step that turns the parts into the feature. **Read `node_modules/next/dist/docs/01-app/` on `searchParams` and page props before writing it.**

`app/waitlist/page.tsx` becomes an async Server Component typed with the global `PageProps<'/waitlist'>` helper. `searchParams` is a **`Promise`** in Next 16 — await it, pass it to `loadWaitlistParams`, call `buildWhere`, then `findWaitlistItems`.

`components/pages/waitlist-page.tsx` stops being `"use client"` and drops `useState`. The `showFilters` toggle moves into a small client wrapper around `ToggleFiltersButton` + the filter panel; everything else renders on the server.

Resolve the `filterCount` TODO at `waitlist-page.tsx:10` by counting non-default parsed params **on the server** — it comes free now.

Clamp `?page=99` to the last page (the spec's edge case; `toPageWindow` already has the logic and its test).

**SECURITY — do not skip. DECISION MADE (user, 2026-09-08): guard in the page, leave `proxy.ts` alone.** Verified above: `proxy.ts` does not protect routes, and layout gating is render-level, so this async page **will execute and query patient data for signed-out visitors**. Guard it: `const { userId } = await auth()` and skip the query when absent, so signed-out visitors still get the existing `LandingPage` via the layout's `<Show when="signed-out">`. Do **not** add `auth.protect()` to `proxy.ts` — `/` permanently redirects to `/waitlist`, so protecting it would bounce signed-out users to Clerk and change the app's front door.

**→ verify:** `npx next build` green · `npx eslint .` clean · walk the spec's edge-case table by hand: `?page=99`, unknown `?sort=`, unknown `?type=`, unknown `?dir=`, `q` containing `%` and `_`, `from` after `to`, **`from == to` returns that day's rows**, **`?page=0` and `?page=-5` do not error**, zero results, and filter-change-while-on-page-5 · confirm a filter change actually re-runs the server query (not just the URL).
**Review:** `[REVIEW: phpro-code-review --fast --fix --staged]`
**Commit:** `UI - Turn waitlist page into a server-filtered overview`

---

### Step 15 — `error.tsx` + `loading.tsx` `[NO SKILL]`

Per the spec's Errors note: a route `error.tsx` boundary for DB failures, and a `loading.tsx` Suspense fallback for navigation. Both under `app/waitlist/`. `error.tsx` must be `"use client"` — check the Next 16 docs for the current contract before writing it.

Keep the fallback cheap; a skeleton matching the table's shape beats a spinner.

**→ verify:** `npx next build` green · loading state appears on filter navigation · a forced query throw renders the boundary, not a crash.
**Commit:** `UI - Add waitlist error and loading boundaries`

---

### Step 16 — Final full review `[NO SKILL]`

Per CLAUDE.md §6, before calling this done:

1. `phpro-code-review --branch $PLAN_BASE_COMMIT` (full mode, scoped to this plan's commits).
2. `react-expert` over the new components — React 19.2 with the React Compiler enabled; manual memoization is usually wrong here and worth flagging.
3. Full gate: `npx next build` · `npx eslint .` · `npm test`.
4. Re-read the spec's Success Criteria and confirm each one. The filter-cost criterion is **three co-located, compile-guarded entries** — one parser in `search-params.ts`, one control descriptor beside it, one condition in `conditions.ts`. (The spec says two; control descriptors were added in Step 4 to keep the filter UI generic, which is the better trade. Anything beyond those three is a finding.)

Show all feedback to the user. Apply nothing without them.

**→ verify:** all three gates green; review findings triaged with the user.
**Commit:** `Chore - Apply waitlist overview review fixes` (only if fixes were made)

---

## Resolved decisions (2026-09-08)

1. **Step 6** — Add `.notNull()` to `waitlist_items.created_at` in the index migration. Backfill is a no-op; the default sort becomes total.
2. **Step 7** — Drop `"use server"` from `lib/db/queries/waitlist-items.ts`. The read stops being a public action endpoint; `lib/actions/waitlist-items.ts` remains the trust boundary.
3. **Step 14** — Guard with `auth()` inside the page. `proxy.ts` is left alone so signed-out visitors keep seeing `LandingPage`.
4. **Step 0** — The Next 16.3.4 bump is intended and belongs on this branch. It also removed the `brace-expansion` override, which was breaking every `eslint` run with `TypeError: expand is not a function`; the lockfile change is part of the same commit.

## Still open

1. **Steps 10 & 12** — `frontend-expert` is tagged on the two visual steps. The existing atoms already encode the design system, so these could be downgraded to `[NO SKILL]`.
