# Multiple waitlists per child Implementation Plan

> For agentic workers: use superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

Goal: one child can be on several waitlists (at most one per type), each entry with its own statuses, intake and registration data, added through the "Nieuwe aanmelding" drawer.

Architecture: a waitlist entry stays one `registrations` row plus one `waitlist_items` row. `waitlist_items` gets a denormalized `patient_id`, tied to its registration by a composite foreign key, so the database can enforce one entry per type per child. The detail route, the update, the delete and the typeahead all key on the entry id. Guardian links stay per registration, so every guardian link or unlink is applied to all registrations of the child.

Tech Stack: Next.js 16 App Router, Drizzle (Postgres on Neon), next-safe-action, Base UI, Zod, node:test.

Spec: `docs/superpowers/specs/2026-11-01-multiple-waitlists-per-child-design.md`

## Global Constraints

- One entry per type per child, enforced by a database constraint, not only by the form.
- The migration keeps every existing person, registration, waitlist item and guardian link unchanged.
- Typeahead debounce is 300 ms, the same as `SEARCH_DEBOUNCE_MS` in `waitlist-search.tsx`. It searches from 2 characters and ignores stale responses.
- All actions keep `authActionClient` and add no role checks.
- Create, update, delete and add-to-child run in one transaction. Each starts by locking the child's `persons` row (`select id from persons where id = $patientId for update`), resolving the patient id from the entry first without a lock where needed. Lock order is the child row, then the entry row, then guardians ordered by id. Under the child lock the type-taken pre-checks are authoritative and a unique violation is only a backstop.
- A unique violation is detected outside the transaction: wrap `db.transaction(...)` in try/catch and map to `"type-taken"` only when the error is a `DrizzleQueryError` whose `cause.code` is `"23505"` and whose `cause.constraint` is `waitlist_items_patient_id_waitlist_type_unique`; rethrow anything else.
- UI text is Dutch, code and files are English, and code carries no comments.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.
- Working agreement for this plan: one task per turn, verified and committed, with the next task explained before it runs. Run `phpro-code-review --fast --staged` before each commit and the full `phpro-code-review` before the PR. No installed skill fits these tasks, so every task is [NO SKILL].
- The only database is the Neon database in `.env.local`. Running a migration or a verification script against it needs the user's go-ahead each time.

## Review Focus

- Two people add the same child to the same type at the same moment: one succeeds, the other gets a "type-taken" message, nobody gets a 500. Pinned in Task 6.
- An entry's type is changed to a type the child already has: the type field shows an error and nothing is saved. Pinned in Task 4.
- A child's name is saved on entry A, then entry B is submitted from a page loaded earlier: B is rejected as stale instead of overwriting the child. Pinned in Task 4.
- A guardian is removed on one entry's detail page while the child has another entry: the guardian disappears from every entry of that child, and stays for other children. Pinned in Task 4.
- Deleting one of two entries keeps the child, the other entry and shared guardians. Deleting the last entry removes the child and the guardians linked nowhere else. Pinned in Task 5.
- Typeahead input: fast typing never shows results of an older query, one character or whitespace never calls the server, and `%` and `_` in a name match literally. Pinned in Tasks 7 and 8.

---

### Task 1: Data model and migration [NO SKILL]

Files:
- Modify: `lib/db/schemas/waitlist-items.ts`, `lib/db/schemas/registrations.ts`, `lib/db/schemas/relations.ts`
- Modify: `lib/db/queries/waitlist-items/create.ts` (insert `patientId`), `lib/types/waitlist-items/index.ts` (omit `patientId` in `savableWaitlistItemSchema`)
- Create: the generated migration folder under `lib/db/migrations/`

Interfaces:
- Produces: `waitlistItemsTable.patientId` (uuid, not null), unique `(patient_id, waitlist_type)`, composite foreign key `(registration_id, patient_id)` to `registrations(id, patient_id)` with cascade, named `waitlist_items_registration_patient_fkey`, `registrationsTable` without a unique `patientId` but with unique `(id, patient_id)` and an index on `patient_id`. `relations.personsTable.patientRegistrations` is `many` (replaces `patientRegistration`).

- [ ] Step 1: Change the three schema files as listed under Interfaces, and make `createWaitlistItem` insert `patientId: patient.id` on the item. `tsc --noEmit` passes.
- [ ] Step 2: Run `npm run db:generate -- --name multiple_waitlists --hints '[{"type":"create","kind":"unique","entity":["public","registrations","registrations_id_patient_id_unique"]}]'`. Without the hint drizzle-kit asks whether the unique constraint is a rename and exits with an error when there is no terminal.
- [ ] Step 3: Edit the generated `migration.sql` into this order, keeping a `--> statement-breakpoint` after every statement you add, because adding a not null column fails on existing rows: add `patient_id` nullable, backfill with `UPDATE waitlist_items ... FROM registrations ... WHERE registrations.id = waitlist_items.registration_id`, set not null, add the unique `(id, patient_id)` on `registrations`, drop the old unique on `registrations.patient_id` (generated name expected `registrations_patient_id_key`, check the generated SQL), create the `patient_id` index, add the unique `(patient_id, waitlist_type)`, add the composite foreign key.
- [ ] Step 4: With the user's go-ahead, run `npm run db:migrate`. Verify with a scratchpad script: every waitlist item's `patient_id` equals its registration's `patient_id`, and inserting a second item with the same `(patient_id, waitlist_type)` fails with code 23505 (clean up the test rows).
- [ ] Step 5: `npm run lint`, `npx tsc --noEmit`, `npm test`. Commit "Allow several waitlist items per child".

### Task 2: Prefill and type helpers [NO SKILL]

Files:
- Create: `lib/utils/functions/children/index.ts`
- Test: `__tests__/lib/utils/functions/children/index.test.ts`

Interfaces:
- Produces: `pickPrefillSource<T extends { createdAt: Date | null }>(registrations: readonly T[]): T | undefined` returns the most recently created, entries with a null date lose to dated ones. `availableWaitlistTypes(all: readonly WaitlistType[], taken: readonly WaitlistType[]): WaitlistType[]` returns `all` minus `taken`, in the original order. The module has only type-level `@/` imports, because plain `node --test` cannot resolve `@/`; callers pass `waitlistTypeValues` as `all`.

- [ ] Step 1: Write the failing tests, importing the module by relative `.ts` path like `record-version.test.ts` does: `pickPrefillSource` picks the newest of three, returns `undefined` for an empty list and prefers a dated entry over a null date; `availableWaitlistTypes(all, [])` returns all of them, `availableWaitlistTypes(all, ["diagnostics"])` returns the others, and a full `taken` list returns `[]`.
- [ ] Step 2: Run `npm test`, expect FAIL (module missing).
- [ ] Step 3: Implement both functions.
- [ ] Step 4: Run `npm test`, expect PASS. Commit "Add prefill and available type helpers".

### Task 3: Entry-keyed detail route and strip [NO SKILL]

Files:
- Modify: `lib/db/queries/waitlist-items/select.ts`, `lib/types/waitlist-items/index.ts`, `components/organisms/list/waitlist-items/waitlist-table.tsx`, `components/pages/waitlist-detail-page.tsx`
- Move: `app/waitlist/[patientId]/[slug]/` to `app/waitlist/[waitlistItemId]/[slug]/` (page, loading, error)
- Create: `components/modules/waitlist-items/other-waitlists-strip.tsx`

Interfaces:
- Produces: `findWaitlistItemById(waitlistItemId: string): Promise<WaitlistItemDetail | undefined>` replaces `findWaitlistItemByPatientId`. `WaitlistItemDetail` gains `otherEntries: { id: string; waitlistType: WaitlistType; planningStatus: PlanningStatus }[]` (the child's other entries, oldest first, handled ones included). `OtherWaitlistsStrip` takes `entries: readonly { id: string; label: string; status: string; href: string }[]` and renders nothing when the list is empty.

- [ ] Step 1: Implement `findWaitlistItemById` (keep the React `cache` wrapper) and the `otherEntries` query (items with the same `patient_id` and a different id).
- [ ] Step 2: Rename the route folder, read `waitlistItemId` from params, call the new query in `generateMetadata` and the page. The page builds the strip entries with `waitlistTypeLabels`, `planningStatusLabels` and hrefs `/waitlist/{id}/{slug}{serialized params}`, and passes them to `WaitlistDetailPage`. `rowHref` in `waitlist-table.tsx` uses `row.id`.
- [ ] Step 3: Render `OtherWaitlistsStrip` under the page title, with the copy "Ook op de wachtlijst van" followed by one link per entry, as in the approved mockup.
- [ ] Step 4: `npm run lint`, `npx tsc --noEmit`, `npm run build`. Manual check with the user: opening a row works, and a child with two entries shows the strip with working links. Commit "Open the detail page by waitlist item".

### Task 4: Update by entry [NO SKILL]

Files:
- Modify: `lib/types/waitlist-items/index.ts`, `lib/db/queries/waitlist-items/update.ts`, `lib/db/queries/waitlist-items/helpers/guardians.ts`, `lib/db/queries/waitlist-items/create.ts` (caller), `lib/actions/waitlist-items.ts`, `components/organisms/form/waitlist-items/waitlist-item-detail-form.tsx`, `lib/utils/functions/record-version/index.ts`, the detail `page.tsx` under `app/waitlist/[waitlistItemId]/[slug]/`
- Test: `__tests__/lib/utils/functions/record-version/index.test.ts`

Interfaces:
- `computeRecordVersion(updatedAt: Date | null, patient: { firstName: string; lastName: string; dob: string | null; tel: string | null; email: string | null }, guardians: readonly VersionedGuardian[]): string` now includes the child's own fields, so an edit of the child's details from any entry changes every sibling's version.
- Produces: `updateWaitlistItemSchema` has `waitlistItemId: z.uuid()` instead of `patientId`. `UpdateWaitlistItemStatus` adds `"type-taken"`. `linkGuardianToRegistrations(tx: Transaction, registrationIds: readonly string[], guardianData: SavablePerson): Promise<Person>` replaces `linkGuardianToRegistration` (find or create once, then insert a link per registration with `onConflictDoNothing`).

- [ ] Step 0: Extend the record version test first: the version changes when `patient.firstName` changes and stays equal when nothing changes. Then change `computeRecordVersion` and its two callers (detail page and `update.ts`).
- [ ] Step 1: `updateWaitlistItem` resolves the entry's `patientId` without a lock, then locks the child row, then the entry by `waitlistItemId` (join to its registration), reads the patient row under that lock for the version check, derives `registrationId` from the entry, and uses `patientId` for the person update and for `planGuardianSync`.
- [ ] Step 2: Inside the transaction, when the submitted type differs from the stored one and another entry of the same child already has it, return `"type-taken"`. Also map the wrapped 23505 error, detected outside the transaction as described in Global Constraints, to `"type-taken"`. The action turns it into a validation error on `waitlistItem.waitlistType` with the message "Dit kind staat al op deze wachtlijst."
- [ ] Step 3: Guardian sync applies to all registrations of the child: unlink deletes the link for every registration id of the patient, link uses `linkGuardianToRegistrations` with all of them. `create.ts` calls the new function with `[registration.id]`.
- [ ] Step 4: The detail form sends `waitlistItemId` (`detail.waitlistItem.id`) instead of `patientId`.
- [ ] Step 5: Verify with a scratchpad script (with the user's go-ahead): a child with two entries and a guardian, remove the guardian through `updateWaitlistItem` on entry A, the guardian is unlinked from both entries; changing entry A's type to entry B's type returns `"type-taken"` and changes nothing; saving a new child name on entry A makes a submit from entry B (with the old version) return `"stale"`. Then `npm run lint`, `npx tsc --noEmit`, `npm test`. Commit "Update waitlist items by entry".

### Task 5: Delete by entry [NO SKILL]

Files:
- Modify: `lib/db/queries/waitlist-items/delete.ts`, `lib/actions/waitlist-items.ts`, `lib/types/waitlist-items/index.ts` (`deleteWaitlistItemSchema`), `components/atoms/buttons/delete-waitlist-item-button.tsx`, `components/pages/waitlist-detail-page.tsx`

Interfaces:
- Produces: `deleteWaitlistItem(waitlistItemId: string): Promise<DeleteWaitlistItemStatus>` with the same statuses. `deleteWaitlistItemSchema` is `{ waitlistItemId: z.uuid() }`. The button prop `patientId` becomes `waitlistItemId`.

- [ ] Step 1: Resolve the entry's `patientId` without a lock, lock the child row, lock the entry, check `handledStatuses` under the lock, lock its guardians in id order, delete the registration (cascades to the item and the links), delete the patient person only when no registration of the patient remains, then run the orphaned guardian delete as it works today (guardians not linked anywhere and not a patient).
- [ ] Step 2: Update the action, schema, button props and the detail page call (`detail.waitlistItem.id`).
- [ ] Step 3: Verify with a scratchpad script (with the user's go-ahead): a child with two handled entries and a shared guardian: deleting entry A keeps the child, entry B and the guardian; deleting entry B removes the child and the guardian; a not-handled entry returns `"not-handled"`; a second delete returns `"not-found"`; two parallel deletes of a child's last two entries (no guardians) leave no orphaned person. Then `npm run lint`, `npx tsc --noEmit`, `npm run build`. Commit "Delete a single waitlist entry".

### Task 6: Add an entry to an existing child [NO SKILL]

Files:
- Create: `lib/db/queries/waitlist-items/add-to-child.ts`
- Modify: `lib/types/waitlist-items/index.ts`, `lib/actions/waitlist-items.ts`

Interfaces:
- Produces: `addWaitlistItemToChildSchema`: `{ patientId: z.uuid(), waitlistType: savableWaitlistItemSchema.shape.waitlistType, registration: savableRegistrationSchema }`. `addWaitlistItemToChild(input: AddWaitlistItemToChild, createdBy: string): Promise<{ status: "created"; waitlistItem: WaitlistItem } | { status: "child-not-found" | "type-taken" }>`. `addWaitlistItemToChildAction` maps the two failure statuses to `returnServerError` with Dutch messages and calls `revalidatePath("/waitlist")`.

- [ ] Step 1: In one transaction: lock the child row, return `"child-not-found"` when the row is missing or has no registration; insert a registration (submitted fields, `createdBy`) and a waitlist item (status defaults, `patientId`, the type); copy the guardian links from the most recent registration of the child (`pickPrefillSource`) to the new registration. A pre-check hit, or the wrapped 23505 error detected outside the transaction as described in Global Constraints, returns `"type-taken"`.
- [ ] Step 2: Verify with a scratchpad script (with the user's go-ahead): adding a second type works, the guardians show on the new entry, adding the same type again returns `"type-taken"`, and two simultaneous adds of one type give exactly one `"created"` and one `"type-taken"`. Then `npm run lint`, `npx tsc --noEmit`. Commit "Add a waitlist entry to an existing child".

### Task 7: Child search [NO SKILL]

Files:
- Create: `lib/db/queries/waitlist-items/children.ts`, `lib/types/children/index.ts`
- Modify: `lib/actions/waitlist-items.ts`

Interfaces:
- Produces: `ChildSearchResult = { patientId: string; firstName: string; lastName: string; dob: string | null; guardianNames: string[]; takenTypes: WaitlistType[]; prefill: { supportNeed: string; registrationMethod: RegistrationMethod; additionalNotes: string | null } }`. `findChildren(query: string, limit?: number): Promise<ChildSearchResult[]>` (default limit 8, ordered by last name, matching the full name with `escapeLikePattern` as `waitlistConditions.q` does, only people with a registration, prefill from `pickPrefillSource`). `searchChildrenAction` validates `{ query: z.string().trim().min(2) }`.

- [ ] Step 1: Implement `findChildren` (ids first, then a relational query with registrations, waitlist items and guardians for those ids) and the action.
- [ ] Step 2: Verify with a scratchpad script (with the user's go-ahead): a query of one character is rejected by the action schema, `%` matches only a literal `%`, a child with two entries returns both types in `takenTypes` and the newest entry's data in `prefill`. Then `npm run lint`, `npx tsc --noEmit`. Commit "Search existing children by name".

### Task 8: Drawer with switch and typeahead [NO SKILL]

Files:
- Create: `lib/hooks/use-debounced-value.ts`, `components/modules/form/child-search.tsx`, `components/modules/form/new-registration-mode-switch.tsx`, `components/organisms/form/new-registration/new-registration-existing-child-form.tsx`
- Modify: `components/atoms/form/select.tsx` (`SelectOption` gets `disabled?: boolean`, rendered as a disabled item), `components/atoms/buttons/new-registration-button.tsx`

Interfaces:
- Consumes: `searchChildrenAction`, `addWaitlistItemToChildAction`, `availableWaitlistTypes`.
- Produces: `useDebouncedValue<T>(value: T, delayMs: number): T`. `ChildSearch` takes `onSelectAction: (child: ChildSearchResult) => void` and shows name, date of birth, guardian names and the types the child is already on. `NewRegistrationModeSwitch` takes `mode: "new" | "existing"` and `onModeChangeAction: (mode) => void`. The existing-child form uses form id `new-registration-form`, so the drawer footer button keeps working, and takes the same props as `NewRegistrationCreateForm` plus `onSubmitBlockedAction: (blocked: boolean) => void`, which it calls with `true` while no child is chosen or the child has no available type.

- [ ] Step 1: `ChildSearch` debounces the input by 300 ms, does not call the action under 2 trimmed characters, and discards a response when a newer request was started (request counter in a ref).
- [ ] Step 2: The existing-child form shows the chosen child's details and guardians read-only, the reason, method and notes pre-filled and editable, and the type select with `availableWaitlistTypes` enabled and the other types disabled with the hint "Dit kind staat al op deze wachtlijst." A child with no available type shows a message.
- [ ] Step 3: `NewRegistrationButton` holds the mode (default "new", reset when the drawer closes), renders the switch at the top and the matching form, and ORs the form's `onSubmitBlockedAction` state into the `disabled` of the footer submit button. The "Nieuw kind" form is unchanged.
- [ ] Step 4: `npm run lint`, `npx tsc --noEmit`, `npm run build`. Manual check with the user in the browser: type quickly and see only the last query's results; add an existing child to a second type; the overview shows two rows; the detail page of each shows the strip. Commit "Add existing children to another waitlist".

### Task 9: Branch verification [NO SKILL]

- [ ] Step 1: Run `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, expect all green.
- [ ] Step 2: Run the full `phpro-code-review` on the branch diff against `origin/dev`, fix findings the user approves, then push and open the PR.

## Known consequence

Old detail links that contain a patient id (`/waitlist/{patientId}/...`) no longer match an entry and show the not-found page.
