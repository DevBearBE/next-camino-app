import { db } from "@/lib/db/drizzle";
import { linkGuardianToRegistration } from "@/lib/db/queries/waitlist-items/guardians";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import {
  type CreateWaitlistItem,
  type WaitlistItem,
} from "@/lib/types/waitlist-items";

export async function createWaitlistItem(
  input: CreateWaitlistItem,
  createdBy: string,
): Promise<WaitlistItem> {
  return db.transaction(async (tx) => {
    const [patient] = await tx
      .insert(personsTable)
      .values(input.patient)
      .returning();

    const [registration] = await tx
      .insert(registrationsTable)
      .values({
        ...input.registration,
        patientId: patient.id,
        createdBy,
      })
      .returning();

    for (const guardianData of input.guardians) {
      await linkGuardianToRegistration(tx, registration.id, guardianData);
    }

    const [waitlistItem] = await tx
      .insert(waitlistItemsTable)
      .values({
        ...input.waitlistItem,
        registrationId: registration.id,
        createdBy,
      })
      .returning();

    return waitlistItem;
  });
}
