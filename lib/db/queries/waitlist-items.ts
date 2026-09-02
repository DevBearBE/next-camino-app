"use server";

import { db } from "@/lib/db/drizzle";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import { type Person, type SavablePerson } from "@/lib/types/persons";
import {
  type CreateWaitlistItem,
  type WaitlistItem,
} from "@/lib/types/waitlist-items";
import { eq, or } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findExistingGuardian(
  tx: Transaction,
  guardianData: Pick<SavablePerson, "tel" | "email">,
): Promise<Person | undefined> {
  if (!guardianData.tel && !guardianData.email) return undefined;

  const [existing] = await tx
    .select()
    .from(personsTable)
    .where(
      or(
        guardianData.tel ? eq(personsTable.tel, guardianData.tel) : undefined,
        guardianData.email
          ? eq(personsTable.email, guardianData.email)
          : undefined,
      ),
    )
    .limit(1);

  return existing;
}

async function findOrCreateGuardian(
  tx: Transaction,
  guardianData: SavablePerson,
): Promise<Person> {
  const existing = await findExistingGuardian(tx, guardianData);

  if (existing) return existing;

  const [created] = await tx
    .insert(personsTable)
    .values(guardianData)
    .returning();

  return created;
}

async function linkGuardianToRegistration(
  tx: Transaction,
  registrationId: string,
  guardianData: SavablePerson,
): Promise<Person> {
  const guardian = await findOrCreateGuardian(tx, guardianData);

  await tx
    .insert(registrationGuardiansTable)
    .values({ registrationId, guardianId: guardian.id });

  return guardian;
}

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
