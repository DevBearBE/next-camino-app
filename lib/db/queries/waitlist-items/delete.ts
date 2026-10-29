import { and, eq, inArray, notExists, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { handledStatuses } from "@/lib/db/enums";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";

export type DeleteWaitlistItemStatus = "deleted" | "not-found" | "not-handled";

export async function deleteWaitlistItem(
  patientId: string,
): Promise<DeleteWaitlistItemStatus> {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        registrationId: registrationsTable.id,
        planningStatus: waitlistItemsTable.planningStatus,
      })
      .from(registrationsTable)
      .innerJoin(
        waitlistItemsTable,
        eq(waitlistItemsTable.registrationId, registrationsTable.id),
      )
      .where(eq(registrationsTable.patientId, patientId))
      .for("update", { of: waitlistItemsTable });

    if (!current) return "not-found";

    if (!handledStatuses.includes(current.planningStatus)) {
      return "not-handled";
    }

    const guardians = await tx
      .select({ id: personsTable.id })
      .from(registrationGuardiansTable)
      .innerJoin(
        personsTable,
        eq(registrationGuardiansTable.guardianId, personsTable.id),
      )
      .where(
        eq(registrationGuardiansTable.registrationId, current.registrationId),
      )
      .orderBy(personsTable.id)
      .for("update", { of: personsTable });

    await tx.delete(personsTable).where(eq(personsTable.id, patientId));

    if (guardians.length > 0) {
      const hasLink = tx
        .select({ one: sql`1` })
        .from(registrationGuardiansTable)
        .where(eq(registrationGuardiansTable.guardianId, personsTable.id));

      const isPatient = tx
        .select({ one: sql`1` })
        .from(registrationsTable)
        .where(eq(registrationsTable.patientId, personsTable.id));

      await tx.delete(personsTable).where(
        and(
          inArray(
            personsTable.id,
            guardians.map((guardian) => guardian.id),
          ),
          notExists(hasLink),
          notExists(isPatient),
        ),
      );
    }

    return "deleted";
  });
}
