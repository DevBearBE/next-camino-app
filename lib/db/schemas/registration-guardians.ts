import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { registrationsTable } from "./registrations";
import { personsTable } from "./persons";

export const registrationGuardiansTable = pgTable(
  "registration_guardians",
  {
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrationsTable.id, { onDelete: "cascade" }),
    guardianId: uuid("guardian_id")
      .notNull()
      .references(() => personsTable.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.registrationId, table.guardianId] }),
    index("registration_guardians_guardian_id_idx").on(table.guardianId),
  ],
);
