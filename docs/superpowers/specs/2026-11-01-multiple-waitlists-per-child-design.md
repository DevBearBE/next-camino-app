# Multiple waitlists per child

## Intent

A child can need more than one kind of care. Today the app lets a child be on exactly one waitlist, because a child has one registration and a registration has one waitlist item (both links are unique in the database). Staff need to put the same child on the waitlist for Diagnostiek and for Psychologische begeleiding, and for Kinderpsychiatrische begeleiding, and to move each of those entries through the waitlist independently. The waitlist types are currently these three, and more types will be added later, so the design must not assume a fixed number.

## Terms

A child is a person row that has a registration (the patient). A waitlist entry is the unit that moves through the waitlist: it has a type (Diagnostiek, Psychologische begeleiding, Kinderpsychiatrische begeleiding), a contact status, a planning status, an intake date and intake person, practical info, and its own registration data (reason for registration, registration method, notes, "aangemeld op" and "aangemeld door"). The child's personal details and guardians are shared by all entries of that child.

## Goals

- One child can have several waitlist entries, at most one per type.
- Each entry has its own statuses, intake, practical info and registration data, and changing one entry never changes another.
- Staff add a child to an additional waitlist from the existing "Nieuwe aanmelding" drawer by choosing an existing child with a typeahead.
- The overview shows one row per entry. The tabs (Actief, Afgehandeld) and their counters count entries, not children.
- The detail page shows one entry. It also shows an optional strip that lists the child's other entries with a link to each.
- Existing data keeps working: every current registration with its waitlist item becomes one entry of its child.

## Non-goals

- Merging children that already exist twice in the database. Patients are always inserted as new rows today and this stays as is.
- Changing the guardian matching rules (a guardian is reused when phone or email matches and the match is not a patient).
- Role or ownership checks on any action. All actions keep checking only that the user is signed in.
- Moving an entry from one child to another.

## Anti-goals

- A child must never end up with two entries of the same type, also when two people submit at the same moment. The database must enforce this, not only the form.
- Deleting one entry must never delete the child while other entries remain.
- The migration must not lose or alter any existing registration, waitlist item, guardian link or person.

## Decisions by the product owner

Adding an entry for an existing child works like this. The "Nieuwe aanmelding" drawer gets a switch at the top with two states, "Nieuw kind" and "Bestaand kind". "Nieuw kind" is the current form and does not change. "Bestaand kind" shows a typeahead that searches children by name. Choosing a result shows the child's details and guardians read-only (editing them stays on the detail page) and pre-fills the reason for registration, the registration method and the notes from the child's existing entry. After saving, the new entry and the entry it was copied from are independent: editing one leaves the other alone. The new entry gets its own "aangemeld op" and "aangemeld door", and its statuses start fresh (not contacted, not planned). The type select disables the types the child already has.

The typeahead is debounced by 300 ms, like the overview search, so a request is not fired on every keystroke.

Overview and detail behave as listed under Goals: one row per entry, counters count entries, and the detail page shows only the data of the opened entry plus the optional strip of the child's other entries.

## Decisions by the assistant

These were not decided by the product owner and are to be checked while reading.

- The pre-fill source is the child's most recently created entry when the child has more than one.
- The typeahead starts searching at two characters, returns a small capped list, and ignores stale responses. Each result carries only name, date of birth, guardian names and the types the child already has. It searches only children (people with a registration), matching the full name the same way the overview search does.
- A child who already has every type is still listed, with all types disabled and a short explanation, so staff are not left wondering why they cannot find the child.
- Deleting an entry ("Fiche verwijderen", only for handled entries, as it works today) removes that entry and its registration data. The child and the guardians that are linked to no other registration are removed together with the child's last entry, using the rules the current delete already uses.
- The type of an existing entry stays editable on the detail page. Choosing a type the child already has is rejected with a clear message.
- The detail page URL must identify the entry, not only the child, because one child now has several entries. The route switches from the patient id to the entry id.
- The strip on the detail page appears only when the child has other entries, and it includes handled ones.
- Edits to the child's personal details and guardians on one entry's detail page apply to the child as a whole, so they show on all entries.

## Constraints

- Stack: Next.js 16 App Router, Drizzle with Postgres (Neon), next-safe-action, Base UI, Zod. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, as AGENTS.md requires.
- Schema today: `persons`, `registrations` (unique `patient_id`, unique link to a patient person), `waitlist_items` (unique `registration_id`, holds the type and statuses), `registration_guardians`. The registration fields named above live on `registrations`, the statuses and intake on `waitlist_items`.
- Create, update and delete run in transactions. The update uses a record version built from the waitlist item's `updatedAt` and the linked guardians, and rejects stale submits. Shared personal data (child and guardians) is edited from the detail page of any entry and then changes for all entries, so the staleness check must stay correct for that.
- The current delete query locks the entry and then the linked guardians in id order. Keep a consistent lock order.
- Existing delete test: a 13-check script run against the real database existed outside the repo. The repo has no database tests.
- Dutch UI text, code and files in English. No comments in code.

## Left to the builder

How the data model changes to allow several entries per child while enforcing one entry per type per child, and how existing rows migrate. The choice of search implementation, the shape of the typeahead component, how the strip on the detail page is laid out, and how counters and queries change.
