import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { registrationMethodValues } from "@/lib/db/enums";
import { personsTable } from "./persons";

export const registrationMethodEnum = pgEnum(
  "registration_method",
  registrationMethodValues,
);

export const registrationsTable = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => personsTable.id, { onDelete: "cascade" }),
    supportNeed: text("support_need").notNull(),
    registrationMethod: registrationMethodEnum("registration_method").notNull(),
    additionalNotes: text("additional_notes"),
    createdAt: timestamp("created_at").defaultNow(),
    createdBy: text("created_by").notNull(),
  },
  (table) => [
    unique("registrations_id_patient_id_unique").on(table.id, table.patientId),
    index("registrations_patient_id_idx").on(table.patientId),
  ],
);
