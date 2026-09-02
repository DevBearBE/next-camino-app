import { personsTable } from "@/lib/db/schemas/persons";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const savablePersonSchema = createInsertSchema(personsTable, {
  firstName: (property) => property.min(1, "Voornaam is vereist"),
  lastName: (property) => property.min(1, "Achternaam is vereist"),
  email: (property) => property.email("Ongeldig emailadres").optional(),
}).omit({ id: true, createdAt: true });
export type SavablePerson = z.infer<typeof savablePersonSchema>;

export const personSchema = createSelectSchema(personsTable);
export type Person = z.infer<typeof personSchema>;
