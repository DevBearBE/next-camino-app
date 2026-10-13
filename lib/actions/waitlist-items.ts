"use server";

import { authActionClient } from "@/lib/actions/safe-action";
import { updateWaitlistItem } from "@/lib/db/queries/waitlist-items/update";
import {
  createWaitlistItemSchema,
  updateWaitlistItemSchema,
} from "@/lib/types/waitlist-items";
import { intakeInPastMessage } from "@/lib/utils/functions/intake";
import { returnServerError, returnValidationErrors } from "next-safe-action";
import { createWaitlistItem } from "../db/queries/waitlist-items/create";

export const createWaitlistItemAction = authActionClient
  .inputSchema(createWaitlistItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const waitlistItem = await createWaitlistItem(parsedInput, ctx.userName);

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
        "Dit dossier werd intussen door iemand anders gewijzigd. Herlaad de pagina en probeer opnieuw.",
      );
    }

    if (status === "not-found") {
      returnServerError("Dit dossier bestaat niet meer.");
    }
  });
