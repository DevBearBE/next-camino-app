"use server";

import { revalidatePath } from "next/cache";
import { returnServerError, returnValidationErrors } from "next-safe-action";
import { authActionClient } from "@/lib/actions/safe-action";
import { deleteWaitlistItem } from "@/lib/db/queries/waitlist-items/delete";
import { updateWaitlistItem } from "@/lib/db/queries/waitlist-items/update";
import {
  createWaitlistItemSchema,
  deleteWaitlistItemSchema,
  updateWaitlistItemSchema,
} from "@/lib/types/waitlist-items";
import { intakeInPastMessage } from "@/lib/utils/functions/intake";
import { createWaitlistItem } from "../db/queries/waitlist-items/create";

export const createWaitlistItemAction = authActionClient
  .inputSchema(createWaitlistItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const waitlistItem = await createWaitlistItem(parsedInput, ctx.userName);

    revalidatePath("/waitlist");

    return waitlistItem;
  });

export const updateWaitlistItemAction = authActionClient
  .inputSchema(updateWaitlistItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const status = await updateWaitlistItem(parsedInput, ctx.userName);

    if (status === "intake-in-past") {
      returnValidationErrors(updateWaitlistItemSchema, {
        waitlistItem: { intakeAt: { _errors: [intakeInPastMessage] } },
      });
    }

    if (status === "stale") {
      returnServerError(
        "Deze fiche werd intussen door iemand anders gewijzigd. Herlaad de pagina en probeer opnieuw.",
      );
    }

    if (status === "not-found") {
      returnServerError("Deze fiche bestaat niet meer.");
    }
  });

export const deleteWaitlistItemAction = authActionClient
  .inputSchema(deleteWaitlistItemSchema)
  .action(async ({ parsedInput }) => {
    const status = await deleteWaitlistItem(parsedInput.patientId);

    if (status === "not-found") {
      returnServerError("Deze fiche bestaat niet meer.");
    }

    if (status === "not-handled") {
      returnServerError(
        "Deze fiche is niet meer afgehandeld en kan niet verwijderd worden.",
      );
    }

    revalidatePath("/waitlist");
  });
