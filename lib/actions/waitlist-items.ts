"use server";

import { revalidatePath } from "next/cache";
import { returnServerError, returnValidationErrors } from "next-safe-action";
import { authActionClient } from "@/lib/actions/safe-action";
import { addWaitlistItemToChild } from "@/lib/db/queries/waitlist-items/add-to-child";
import { deleteWaitlistItem } from "@/lib/db/queries/waitlist-items/delete";
import { updateWaitlistItem } from "@/lib/db/queries/waitlist-items/update";
import {
  addWaitlistItemToChildSchema,
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

    if (status === "type-taken") {
      returnValidationErrors(updateWaitlistItemSchema, {
        waitlistItem: {
          waitlistType: {
            _errors: ["Dit kind staat al op deze wachtlijst."],
          },
        },
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

export const deleteWaitlistItemAction = authActionClient
  .inputSchema(deleteWaitlistItemSchema)
  .action(async ({ parsedInput }) => {
    const status = await deleteWaitlistItem(parsedInput.waitlistItemId);

    if (status === "not-found") {
      returnServerError("Dit dossier bestaat niet meer.");
    }

    if (status === "not-handled") {
      returnServerError(
        "Dit dossier is niet meer afgehandeld en kan niet verwijderd worden.",
      );
    }

    revalidatePath("/waitlist");
  });

const addToChildErrors = {
  "child-not-found": "Dit kind bestaat niet meer.",
  "type-taken": "Dit kind staat al op deze wachtlijst.",
} as const;

export const addWaitlistItemToChildAction = authActionClient
  .inputSchema(addWaitlistItemToChildSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await addWaitlistItemToChild(parsedInput, ctx.userName);

    if (result.status !== "created") {
      return returnServerError(addToChildErrors[result.status]);
    }

    revalidatePath("/waitlist");

    return result.waitlistItem;
  });
