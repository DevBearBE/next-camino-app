import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { isTypeTakenViolation } from "@/lib/db/queries/waitlist-items/helpers/errors";
import { linkGuardianToRegistrations } from "@/lib/db/queries/waitlist-items/helpers/guardians";
import { lockChild } from "@/lib/db/queries/waitlist-items/helpers/locks";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import type { UpdateWaitlistItem } from "@/lib/types/waitlist-items";
import { planGuardianSync } from "@/lib/utils/functions/guardians";
import { isBeforeToday } from "@/lib/utils/functions/helpers";
import { computeRecordVersion } from "@/lib/utils/functions/record-version";

export type UpdateWaitlistItemStatus =
  | "updated"
  | "not-found"
  | "stale"
  | "intake-in-past"
  | "type-taken";

const ISO_DAY_LENGTH = 10;

const toStoredIntake = (isoDate: string | null): Date | null =>
  isoDate ? new Date(`${isoDate}T00:00:00Z`) : null;

export async function updateWaitlistItem(
  input: UpdateWaitlistItem,
  updatedBy: string,
): Promise<UpdateWaitlistItemStatus> {
  try {
    return await db.transaction(async (tx) => {
      const [entry] = await tx
        .select({ patientId: waitlistItemsTable.patientId })
        .from(waitlistItemsTable)
        .where(eq(waitlistItemsTable.id, input.waitlistItemId));

      if (!entry || !(await lockChild(tx, entry.patientId))) {
        return "not-found";
      }

      const { patientId } = entry;

      const [current] = await tx
        .select({
          registrationId: registrationsTable.id,
          waitlistItemId: waitlistItemsTable.id,
          updatedAt: waitlistItemsTable.updatedAt,
          intakeAt: waitlistItemsTable.intakeAt,
          waitlistType: waitlistItemsTable.waitlistType,
        })
        .from(waitlistItemsTable)
        .innerJoin(
          registrationsTable,
          eq(waitlistItemsTable.registrationId, registrationsTable.id),
        )
        .where(eq(waitlistItemsTable.id, input.waitlistItemId))
        .for("update", { of: waitlistItemsTable });

      if (!current) return "not-found";

      const [patient] = await tx
        .select({
          firstName: personsTable.firstName,
          lastName: personsTable.lastName,
          dob: personsTable.dob,
          tel: personsTable.tel,
          email: personsTable.email,
        })
        .from(personsTable)
        .where(eq(personsTable.id, patientId));

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
        computeRecordVersion(current.updatedAt, patient, linkedGuardians) !==
        input.version
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

      if (input.waitlistItem.waitlistType !== current.waitlistType) {
        const [clash] = await tx
          .select({ id: waitlistItemsTable.id })
          .from(waitlistItemsTable)
          .where(
            and(
              eq(waitlistItemsTable.patientId, patientId),
              eq(
                waitlistItemsTable.waitlistType,
                input.waitlistItem.waitlistType,
              ),
              ne(waitlistItemsTable.id, current.waitlistItemId),
            ),
          );

        if (clash) return "type-taken";
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
        .where(eq(personsTable.id, patientId));

      await tx
        .update(registrationsTable)
        .set({
          supportNeed: input.registration.supportNeed,
          registrationMethod: input.registration.registrationMethod,
          additionalNotes: input.registration.additionalNotes ?? null,
        })
        .where(eq(registrationsTable.id, current.registrationId));

      const waitlistItemValues = {
        waitlistType: input.waitlistItem.waitlistType,
        contactStatus: input.waitlistItem.contactStatus,
        planningStatus: input.waitlistItem.planningStatus,
        intakeAt: toStoredIntake(submittedIntake),
        intakeBy: input.waitlistItem.intakeBy,
        practicalInfo: input.waitlistItem.practicalInfo,
      } satisfies Record<keyof UpdateWaitlistItem["waitlistItem"], unknown>;

      await tx
        .update(waitlistItemsTable)
        .set({ ...waitlistItemValues, updatedBy })
        .where(eq(waitlistItemsTable.id, current.waitlistItemId));

      const plan = planGuardianSync(
        linkedGuardians.map((guardian) => guardian.id),
        input.guardians,
        patientId,
      );

      const childRegistrations = await tx
        .select({ id: registrationsTable.id })
        .from(registrationsTable)
        .where(eq(registrationsTable.patientId, patientId));
      const childRegistrationIds = childRegistrations.map(
        (registration) => registration.id,
      );

      if (plan.toUnlink.length > 0) {
        await tx
          .delete(registrationGuardiansTable)
          .where(
            and(
              inArray(
                registrationGuardiansTable.registrationId,
                childRegistrationIds,
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
        await linkGuardianToRegistrations(tx, childRegistrationIds, {
          firstName: guardian.firstName,
          lastName: guardian.lastName,
          tel: guardian.tel,
          email: guardian.email,
        });
      }

      return "updated";
    });
  } catch (error) {
    if (isTypeTakenViolation(error)) return "type-taken";

    throw error;
  }
}
