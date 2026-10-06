import {
  waitlistItemsTable,
  waitlistTypeEnum,
} from "@/lib/db/schemas/waitlist-items";
import { personSchema, savablePersonSchema } from "@/lib/types/persons";
import {
  registrationSchema,
  savableRegistrationSchema,
} from "@/lib/types/registrations";
import { intakeRuleIssues } from "@/lib/utils/functions/intake";
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

export const waitlistRowSchema = z.object({
  id: waitListItemSchema.shape.id,
  patientId: personSchema.shape.id,
  firstName: personSchema.shape.firstName,
  lastName: personSchema.shape.lastName,
  dob: personSchema.shape.dob,
  waitlistType: waitListItemSchema.shape.waitlistType,
  contactStatus: waitListItemSchema.shape.contactStatus,
  planningStatus: waitListItemSchema.shape.planningStatus,
  registeredOn: waitListItemSchema.shape.createdAt,
  intakeAt: waitListItemSchema.shape.intakeAt,
});
export type WaitlistRow = z.infer<typeof waitlistRowSchema>;

export const waitlistItemDetailSchema = z.object({
  waitlistItem: waitListItemSchema,
  registration: registrationSchema,
  patient: personSchema,
  guardians: z.array(personSchema),
});
export type WaitlistItemDetail = z.infer<typeof waitlistItemDetailSchema>;

export const updateWaitlistItemSchema = z
  .object({
    patientId: z.uuid(),
    version: z.string(),
    patient: savablePersonSchema,
    registration: savableRegistrationSchema,
    waitlistItem: z.object({
      waitlistType: savableWaitlistItemSchema.shape.waitlistType,
      contactStatus: waitListItemSchema.shape.contactStatus,
      planningStatus: waitListItemSchema.shape.planningStatus,
      intakeAt: z.iso.date().nullable(),
      intakeBy: z.string().nullable(),
    }),
    guardians: z.array(
      savablePersonSchema.omit({ dob: true }).extend({ id: z.uuid() }),
    ),
  })
  .superRefine(({ waitlistItem }, ctx) => {
    intakeRuleIssues(waitlistItem).forEach(({ field, message }) =>
      ctx.addIssue({ code: "custom", message, path: ["waitlistItem", field] }),
    );
  });
export type UpdateWaitlistItem = z.infer<typeof updateWaitlistItemSchema>;

// Transaction input schema
export const createWaitlistItemSchema = z.object({
  patient: savablePersonSchema,
  guardians: z.array(savablePersonSchema).default([]),
  registration: savableRegistrationSchema,
  waitlistItem: savableWaitlistItemSchema,
});
export type CreateWaitlistItem = z.infer<typeof createWaitlistItemSchema>;
