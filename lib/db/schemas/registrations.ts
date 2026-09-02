import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { personsTable } from "./persons";

export const registrationMethodEnum = pgEnum("registration_method", [
  "mail",
  "phone",
]);

export const registrationsTable = pgTable("registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .unique()
    .references(() => personsTable.id, { onDelete: "cascade" }),
  supportNeed: text("support_need").notNull(),
  registrationMethod: registrationMethodEnum("registration_method").notNull(),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").notNull(),
});
