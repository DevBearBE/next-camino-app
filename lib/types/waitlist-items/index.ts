import {
  waitlistItemsTable,
  waitlistTypeEnum,
} from "@/lib/db/schemas/waitlist-items";
import { savablePersonSchema } from "@/lib/types/persons";
import { savableRegistrationSchema } from "@/lib/types/registrations";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const savableWaitlistItemSchema = createInsertSchema(
  waitlistItemsTable,
  {
    waitlistType: z.enum(waitlistTypeEnum.enumValues, {
      error: "Gelieve een keuze te maken",
    }),
  },
).omit({
  id: true,
  registrationId: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
});
export type SavableWaitlistItem = z.infer<typeof savableWaitlistItemSchema>;

export const waitListItemSchema = createSelectSchema(waitlistItemsTable);
export type WaitlistItem = z.infer<typeof waitListItemSchema>;

// Transaction input schema
export const createWaitlistItemSchema = z.object({
  patient: savablePersonSchema,
  guardians: z.array(savablePersonSchema).default([]),
  registration: savableRegistrationSchema,
  waitlistItem: savableWaitlistItemSchema,
});
export type CreateWaitlistItem = z.infer<typeof createWaitlistItemSchema>;
