import { eq } from "drizzle-orm";
import type { Transaction } from "@/lib/db/queries/waitlist-items/helpers/guardians";
import { personsTable } from "@/lib/db/schemas/persons";

export async function lockChild(
  tx: Transaction,
  patientId: string,
): Promise<boolean> {
  const rows = await tx
    .select({ id: personsTable.id })
    .from(personsTable)
    .where(eq(personsTable.id, patientId))
    .for("update");

  return rows.length > 0;
}
