# Waitlist Overview — Server Filtering, Sorting and Pagination

Status: approved design, ready for implementation planning
Date: 2026-09-08
Branch: `feature/waitlist-overview`

## Goal

Turn `/waitlist` from a stub into a working overview: a table of waitlist items that a
coordinator can filter, sort and page through. All three happen on the server. The client
never fetches data and never holds a full result set.

Success criteria:

- Filter, sort and page state live in the URL and survive reload and sharing.
- Every filter and every sort is applied in SQL. The browser receives one page of rows.
- Adding a filter to any list is one entry in a parser map plus one in a condition map.
- Adding a new list means a parser map, a condition map and a column array — no new machinery.
- Invalid URL input degrades to a sane default instead of erroring.

## Decisions

| Decision | Choice |
|---|---|
| Pagination | Offset + `COUNT(*)`, page numbers, jump-to-page |
| Page size | Fixed at 25 |
| Filter semantics | Single value per filter (`eq`), not multi-value |
| Filters | Waitlist type, contact status, planning status, name search, registered-on date range |
| Sorting | User-controllable on whitelisted columns, default `created_at DESC` |
| Columns | Name, type, contact status, planning status, registered-on, support need, intake date, date of birth |
| URL state | `nuqs`, already a dependency |
| Generic core | Filtering and sorting fully generic; cell rendering concrete |

### Why offset and not keyset

The screen exists to answer "how many are waiting" and "let me jump to page 4". Keyset
pagination gives up both. Offset only degrades on deep pages over very large tables; a
practice waitlist taking 300 registrations a year needs two decades to reach 6,000 rows,
where `OFFSET 5975` on an indexed sort is sub-millisecond. If `COUNT(*)` ever becomes the
bottleneck, the fix is a cheaper count behind the same interface, not a rewrite — the count
is one swappable function and the page-number UI survives the change.

### Why generic filtering and sorting, but concrete cells

A factory that builds arbitrary Drizzle queries destroys type inference. The split that
holds: the generic core owns everything schema-independent — parsing, condition assembly,
order-by assembly, offset math, running rows and count in parallel. The schema-dependent
parts arrive as typed inputs. Generics stay at `TParser`, `TColumns` and `TRow`, all inferred.

## Verified type contract

The core generics were compiled against this repo's `tsconfig.json` before this spec was
written. Negative assertions were mutation-tested: making a rejected case valid causes
`TS2578: Unused '@ts-expect-error' directive`, so the assertions are live.

Confirmed:

- `filter(parser, toCondition)` infers the value type from the parser. Pairing
  `parseAsIsoDate` with a `(value: string)` handler is a compile error.
- `defineSort(columns, fallback, tiebreaker)` derives the URL whitelist from the column map,
  so `?sort=` cannot drift from what is sortable. `toOrderBy("supportNeed")` is a compile error.
- The params type comes from `inferParserType` over the assembled parser map. Declared once.

Two findings that shape the code:

- nuqs's parser type is **invariant** in `T`. The generic bound must be
  `GenericParserBuilder<any>`, which is nuqs's own convention for this. `ParserBuilder<never>`
  does not work.
- `withDefault()` returns `Omit<SingleParserBuilder<T>, "parseServerSide"> & {...}`, not a
  `SingleParserBuilder<T>`. Defaults therefore belong on the assembled parser map, not
  inside `FilterDef`.

One accepted seam: `Object.entries` erases key types, so `buildWhere` carries a single
contained `as never` inside a five-line function. Both sides of that function are exact.

## Architecture

### Module layout

```
lib/lists/
  filters.ts                filter(), buildWhere(), defineSort()      generic, no schema
  types.ts                  ColumnDef<TRow, TSortKey>, ListResult, SortDirection
  pagination.ts             toOffset(), toPageCount(), toPageWindow()  pure

lib/lists/waitlist-items/
  search-params.ts          parser map + control descriptors   shared client/server, no Drizzle
  conditions.ts             ConditionMap<typeof parsers>       server only, imports Drizzle

lib/db/queries/waitlist-items.ts     + findWaitlistItems (alongside createWaitlistItem)
lib/types/waitlist-items/index.ts    + WaitlistRow

components/organisms/list/
  data-table.tsx            renders ColumnDef<TRow, TSortKey>[]        generic
  list-filters.tsx          renders control descriptors by discriminant generic
components/modules/pagination/pagination.tsx                            generic
components/atoms/table/sortable-header.tsx                              generic

components/organisms/list/waitlist-items/columns.tsx   ColumnDef<WaitlistRow, WaitlistSortKey>[]
```

The dividing line that matters is **does this file import Drizzle**, not generic versus
concrete. The parser map is imported by both the client controls and the server loader, so
it must stay free of any DB import. That is why `toCondition` lives in a separate
`conditions.ts` rather than inside the filter definition.

`ConditionMap<TParsers>` is a mapped type over the parser map:

```ts
type ConditionMap<TParsers> = {
  [K in keyof TParsers]: (value: NonNullable<inferParserType<TParsers[K]>>) => SQL
}
```

A missing or misspelled key is a compile error, so the two halves cannot drift.

### Data flow

For `/waitlist?type=diagnostics&contactStatus=contacted&sort=createdAt&dir=desc&page=2`:

1. `app/waitlist/page.tsx` is an async Server Component typed with `PageProps<'/waitlist'>`.
   It awaits `searchParams` (a `Promise` in Next 16).
2. nuqs's `createLoader` over the shared parser map parses them into typed values with
   defaults applied. Unknown enum values parse to `null` and the filter is simply dropped.
3. `buildWhere(conditions, values)` assembles a single `SQL | undefined`.
4. `findWaitlistItems` runs the rows query and the count query through `Promise.all`
   against that same where clause.
5. Returns `{ rows, total, page, pageCount, sort }`.
6. `<DataTable>` and `<Pagination>` render on the server. Pagination emits `<Link href>`
   built with nuqs's `createSerializer`, so page links preserve active filters and need no JS.
7. Only the filter controls and search box are client components, bound with `useQueryStates`.
   Changing one pushes a new URL; Next re-renders the server component with fresh data.

### Query details

Base query joins `waitlist_items → registrations → persons` (the patient). The join is
required for both the rows query and the count query, because name search filters on
`persons`.

Sort whitelist maps to real columns:

| Sort key | Column |
|---|---|
| `createdAt` | `waitlist_items.created_at` |
| `lastName` | `persons.last_name` |
| `waitlistType` | `waitlist_items.waitlist_type` |
| `contactStatus` | `waitlist_items.contact_status` |
| `planningStatus` | `waitlist_items.planning_status` |
| `intakeAt` | `waitlist_items.intake_at` |
| `dob` | `persons.dob` |

Default sort is `waitlist_items.created_at DESC`. Sorting on the primary table rather than
`registrations.created_at` keeps the sort indexable without reaching through the join; the
two values are written in the same transaction, so they order identically.

`desc(waitlist_items.id)` is appended as a tiebreaker on every sort, so rows cannot shuffle
between pages when sort values tie.

Name search uses `ilike` over the concatenated first and last name so "jan de" matches.
`%` and `_` in user input must be escaped before interpolation.

The date range is a single `from`/`to` pair over `waitlist_items.created_at` — the same
"registered on" value shown in the column and used as the default sort. `intake_at` is
displayed and sortable but not filterable; a second range filter can be added later as one
more parser plus one more condition.

Indexes to add in the same migration: `waitlist_items(created_at)` for the default sort, and
`waitlist_items(contact_status)`, `waitlist_items(planning_status)`, `waitlist_items(waitlist_type)`
for the filters. Name search runs a sequential scan; at this table size that is correct, and
`pg_trgm` is the upgrade path if it ever stops being.

### Changes to existing code

All four are forced by the change, not opportunistic:

- `components/pages/waitlist-page.tsx` is currently `"use client"` with `useState`. It becomes
  a Server Component; the `showFilters` toggle moves into a small client wrapper.
- `app/layout.tsx` needs `NuqsAdapter` from `nuqs/adapters/next/app`.
- `components/organisms/ui/header.tsx` has a dead search input with its `value`/`onChange`
  commented out. It gets wired to the `q` param with a debounced client component.
- `components/organisms/ui/header.tsx:1` imports `@/lib/types/ui/breadcrumb`, which does not
  exist and currently breaks `next build`. Since the header is being edited anyway, this is
  resolved: define the type, or drop the unused prop.

The `filterCount` TODO at `waitlist-page.tsx:10` resolves for free — count the non-default
parsed params on the server.

## Edge cases

| Case | Behaviour |
|---|---|
| `?page=99` beyond last page | Clamp to last page; render empty state if there are no rows at all |
| `?sort=` unknown key | nuqs returns the default (`createdAt`) |
| `?type=` unknown enum value | Parses to `null`; filter is dropped, not an error |
| `?dir=` unknown | Defaults to `desc` |
| Name search containing `%` or `_` | Escaped before interpolation into the `ILIKE` pattern |
| Date range with `from` after `to` | Both conditions applied; yields zero rows. No special case |
| Zero results | Empty state in the table body; pagination hidden |
| Filter change while on page 5 | Page resets to 1 |

Errors: a DB failure propagates to a route `error.tsx` boundary. A `loading.tsx` provides the
Suspense fallback during navigation.

## Testing

Node 26 runs TypeScript test files natively — `node --test lib/**/*.test.ts` needs no new
dependency, no framework and no config. Verified in this repo.

Covered, because these are pure functions with real branching:

- `buildWhere` — no filters yields `undefined`; one filter yields one condition; null and
  undefined values are skipped; multiple filters combine.
- `toPageCount` / `toOffset` / `toPageWindow` — zero results, exact multiples, partial last
  page, clamping past the end.
- The name-search escaper — `%` and `_` in input do not become wildcards.

Not covered: Drizzle query construction and React rendering. Testing those needs a database
or a renderer, and neither earns its keep at this stage.

## Out of scope

Multi-value filters, per-user page size, saved filter presets, CSV export, row detail view,
row actions, and column visibility toggles. Each is additive and none changes the design.
