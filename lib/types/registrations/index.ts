import { createInsertSchema } from "drizzle-orm/zod";
import {
  registrationMethodEnum,
  registrationsTable,
} from "@/lib/db/schemas/registrations";
import { z } from "zod";

export const savableRegistrationSchema = createInsertSchema(
  registrationsTable,
  {
    supportNeed: (property) =>
      property.min(1, "Ondersteuningsvraag is vereist"),
    registrationMethod: () =>
      z.enum(registrationMethodEnum.enumValues, {
        error: "Gelieve een keuze te maken",
      }),
  },
).omit({ id: true, createdAt: true, createdBy: true, patientId: true });
export type SavableRegistration = z.infer<typeof savableRegistrationSchema>;
