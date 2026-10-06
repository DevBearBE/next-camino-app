import { db } from "@/lib/db/drizzle";
import { linkGuardianToRegistration } from "@/lib/db/queries/waitlist-items/guardians";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import type { UpdateWaitlistItem } from "@/lib/types/waitlist-items";
import { planGuardianSync } from "@/lib/utils/functions/guardians";
import { isBeforeToday } from "@/lib/utils/functions/helpers";
import { computeRecordVersion } from "@/lib/utils/functions/record-version";
import { and, eq, inArray } from "drizzle-orm";

export type UpdateWaitlistItemStatus =
  | "updated"
  | "not-found"
  | "stale"
  | "intake-in-past";

const ISO_DAY_LENGTH = 10;

const toStoredIntake = (isoDate: string | null): Date | null =>
  isoDate ? new Date(`${isoDate}T00:00:00Z`) : null;

export async function updateWaitlistItem(
  input: UpdateWaitlistItem,
  updatedBy: string,
): Promise<UpdateWaitlistItemStatus> {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        registrationId: registrationsTable.id,
        waitlistItemId: waitlistItemsTable.id,
        updatedAt: waitlistItemsTable.updatedAt,
        intakeAt: waitlistItemsTable.intakeAt,
      })
      .from(registrationsTable)
      .innerJoin(
        waitlistItemsTable,
        eq(waitlistItemsTable.registrationId, registrationsTable.id),
      )
      .where(eq(registrationsTable.patientId, input.patientId))
      .for("update", { of: waitlistItemsTable });

    if (!current) return "not-found";

    const linkedGuardians = await tx
      .select({
        id: personsTable.id,
        firstName: personsTable.firstName,
        lastName: personsTable.lastName,
        tel: personsTable.tel,
        email: personsTable.email,
      })
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

    if (
      computeRecordVersion(current.updatedAt, linkedGuardians) !== input.version
    ) {
      return "stale";
    }

    const submittedIntake = input.waitlistItem.intakeAt;
    const storedIntake =
      current.intakeAt?.toISOString().slice(0, ISO_DAY_LENGTH) ?? null;

    if (
      submittedIntake &&
      submittedIntake !== storedIntake &&
      isBeforeToday(submittedIntake)
    ) {
      return "intake-in-past";
    }

    await tx
      .update(personsTable)
      .set({
        firstName: input.patient.firstName,
        lastName: input.patient.lastName,
        dob: input.patient.dob ?? null,
        tel: input.patient.tel ?? null,
        email: input.patient.email ?? null,
      })
      .where(eq(personsTable.id, input.patientId));

    await tx
      .update(registrationsTable)
      .set({
        supportNeed: input.registration.supportNeed,
        registrationMethod: input.registration.registrationMethod,
        additionalNotes: input.registration.additionalNotes ?? null,
      })
      .where(eq(registrationsTable.id, current.registrationId));

    await tx
      .update(waitlistItemsTable)
      .set({
        waitlistType: input.waitlistItem.waitlistType,
        contactStatus: input.waitlistItem.contactStatus,
        planningStatus: input.waitlistItem.planningStatus,
        intakeAt: toStoredIntake(submittedIntake),
        intakeBy: input.waitlistItem.intakeBy,
        updatedBy,
      })
      .where(eq(waitlistItemsTable.id, current.waitlistItemId));

    const plan = planGuardianSync(
      linkedGuardians.map((guardian) => guardian.id),
      input.guardians,
      input.patientId,
    );

    if (plan.toUnlink.length > 0) {
      await tx
        .delete(registrationGuardiansTable)
        .where(
          and(
            eq(
              registrationGuardiansTable.registrationId,
              current.registrationId,
            ),
            inArray(registrationGuardiansTable.guardianId, plan.toUnlink),
          ),
        );
    }

    for (const guardian of plan.toUpdate) {
      await tx
        .update(personsTable)
        .set({
          firstName: guardian.firstName,
          lastName: guardian.lastName,
          tel: guardian.tel ?? null,
          email: guardian.email ?? null,
        })
        .where(eq(personsTable.id, guardian.id));
    }

    for (const guardian of plan.toLink) {
      await linkGuardianToRegistration(tx, current.registrationId, {
        firstName: guardian.firstName,
        lastName: guardian.lastName,
        tel: guardian.tel,
        email: guardian.email,
      });
    }

    return "updated";
  });
}
