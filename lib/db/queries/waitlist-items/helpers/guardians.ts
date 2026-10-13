import { db } from "@/lib/db/drizzle";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { type Person, type SavablePerson } from "@/lib/types/persons";
import { and, eq, notExists, or, sql } from "drizzle-orm";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findExistingGuardian(
  tx: Transaction,
  guardianData: Pick<SavablePerson, "tel" | "email">,
): Promise<Person | undefined> {
  if (!guardianData.tel && !guardianData.email) return undefined;

  const isPatient = tx
    .select({ one: sql`1` })
    .from(registrationsTable)
    .where(eq(registrationsTable.patientId, personsTable.id));

  const [existing] = await tx
    .select()
    .from(personsTable)
    .where(
      and(
        or(
          guardianData.tel ? eq(personsTable.tel, guardianData.tel) : undefined,
          guardianData.email
            ? eq(personsTable.email, guardianData.email)
            : undefined,
        ),
        notExists(isPatient),
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

export async function linkGuardianToRegistration(
  tx: Transaction,
  registrationId: string,
  guardianData: SavablePerson,
): Promise<Person> {
  const guardian = await findOrCreateGuardian(tx, guardianData);

  await tx
    .insert(registrationGuardiansTable)
    .values({ registrationId, guardianId: guardian.id })
    .onConflictDoNothing();

  return guardian;
}
