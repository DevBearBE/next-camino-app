import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";

export const personsTable = pgTable("persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob"),
  tel: text("tel"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});
