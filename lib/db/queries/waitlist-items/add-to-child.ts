import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { isTypeTakenViolation } from "@/lib/db/queries/waitlist-items/helpers/errors";
import { lockChild } from "@/lib/db/queries/waitlist-items/helpers/locks";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import type {
  AddWaitlistItemToChild,
  WaitlistItem,
} from "@/lib/types/waitlist-items";
import { pickPrefillSource } from "@/lib/utils/functions/children";

export type AddWaitlistItemToChildResult =
  | { readonly status: "created"; readonly waitlistItem: WaitlistItem }
  | { readonly status: "child-not-found" | "type-taken" };

export async function addWaitlistItemToChild(
  input: AddWaitlistItemToChild,
  createdBy: string,
): Promise<AddWaitlistItemToChildResult> {
  try {
    return await db.transaction(async (tx) => {
      if (!(await lockChild(tx, input.patientId))) {
        return { status: "child-not-found" };
      }

      const entries = await tx
        .select({
          registrationId: registrationsTable.id,
          createdAt: registrationsTable.createdAt,
          waitlistType: waitlistItemsTable.waitlistType,
        })
        .from(registrationsTable)
        .innerJoin(
          waitlistItemsTable,
          eq(waitlistItemsTable.registrationId, registrationsTable.id),
        )
        .where(eq(registrationsTable.patientId, input.patientId));

      const source = pickPrefillSource(entries);

      if (!source) return { status: "child-not-found" };

      if (entries.some((entry) => entry.waitlistType === input.waitlistType)) {
        return { status: "type-taken" };
      }

      const [registration] = await tx
        .insert(registrationsTable)
        .values({
          ...input.registration,
          patientId: input.patientId,
          createdBy,
        })
        .returning();

      const [waitlistItem] = await tx
        .insert(waitlistItemsTable)
        .values({
          registrationId: registration.id,
          patientId: input.patientId,
          waitlistType: input.waitlistType,
          createdBy,
        })
        .returning();

      const guardianLinks = await tx
        .select({ guardianId: registrationGuardiansTable.guardianId })
        .from(registrationGuardiansTable)
        .where(
          eq(registrationGuardiansTable.registrationId, source.registrationId),
        );

      if (guardianLinks.length > 0) {
        await tx.insert(registrationGuardiansTable).values(
          guardianLinks.map((link) => ({
            registrationId: registration.id,
            guardianId: link.guardianId,
          })),
        );
      }

      return { status: "created", waitlistItem };
    });
  } catch (error) {
    if (isTypeTakenViolation(error)) return { status: "type-taken" };

    throw error;
  }
}
