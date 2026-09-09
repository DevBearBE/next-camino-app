import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  contactStatusValues,
  planningStatusValues,
  waitlistTypeValues,
} from "@/lib/db/enums";
import { registrationsTable } from "./registrations";

export const waitlistTypeEnum = pgEnum("waitlist_type", waitlistTypeValues);

export const contactStatusEnum = pgEnum("contact_status", contactStatusValues);

export const planningStatusEnum = pgEnum("planning_status", planningStatusValues);

export const waitlistItemsTable = pgTable(
  "waitlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .unique()
      .references(() => registrationsTable.id, { onDelete: "cascade" }),
    waitlistType: waitlistTypeEnum("waitlist_type").notNull(),
    contactStatus: contactStatusEnum("contact_status")
      .notNull()
      .default("not_contacted"),
    planningStatus: planningStatusEnum("planning_status")
      .notNull()
      .default("not_planned"),
    intakeAt: timestamp("intake_at"),
    intakeBy: text("intake_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    updatedBy: text("updated_by"),
  },
  (table) => [
    index("waitlist_items_created_at_idx").on(table.createdAt),
    index("waitlist_items_contact_status_idx").on(table.contactStatus),
    index("waitlist_items_planning_status_idx").on(table.planningStatus),
    index("waitlist_items_waitlist_type_idx").on(table.waitlistType),
  ],
);
