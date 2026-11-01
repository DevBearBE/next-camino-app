import { and, eq, exists, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { escapeLikePattern } from "@/lib/lists/filters";
import type { ChildSearchResult } from "@/lib/types/children";
import { pickPrefillSource } from "@/lib/utils/functions/children";
import { formatFullName } from "@/lib/utils/functions/helpers";

const DEFAULT_LIMIT = 8;

export async function findChildren(
  query: string,
  limit = DEFAULT_LIMIT,
): Promise<ChildSearchResult[]> {
  const tokens = query.split(/\s+/).filter(Boolean);
  const matches = await db
    .select({ id: personsTable.id })
    .from(personsTable)
    .where(
      and(
        exists(
          db
            .select({ one: sql`1` })
            .from(registrationsTable)
            .where(eq(registrationsTable.patientId, personsTable.id)),
        ),
        ...tokens.map((token) =>
          or(
            ilike(personsTable.firstName, `%${escapeLikePattern(token)}%`),
            ilike(personsTable.lastName, `%${escapeLikePattern(token)}%`),
          ),
        ),
      ),
    )
    .orderBy(personsTable.lastName, personsTable.firstName)
    .limit(limit);

  if (matches.length === 0) return [];

  const ids = matches.map((match) => match.id);
  const children = await db.query.personsTable.findMany({
    where: { id: { in: ids } },
    with: {
      patientRegistrations: {
        with: { waitlistItem: true, guardians: true },
      },
    },
  });
  const byId = new Map(children.map((child) => [child.id, child]));

  return ids.flatMap((id) => {
    const child = byId.get(id);
    const entries = (child?.patientRegistrations ?? []).filter(
      (registration) => registration.waitlistItem,
    );
    const source = pickPrefillSource(entries);

    if (!child || !source) return [];

    return [
      {
        patientId: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        dob: child.dob,
        guardianNames: source.guardians.map(formatFullName),
        takenTypes: entries.flatMap((entry) =>
          entry.waitlistItem ? [entry.waitlistItem.waitlistType] : [],
        ),
        prefill: {
          supportNeed: source.supportNeed,
          registrationMethod: source.registrationMethod,
          additionalNotes: source.additionalNotes,
        },
      },
    ];
  });
}
