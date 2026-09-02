"use server";

import { authActionClient } from "@/lib/actions/safe-action";
import { createWaitlistItemSchema } from "@/lib/types/waitlist-items";
import { createWaitlistItem } from "../db/queries/waitlist-items";

export const createWaitlistItemAction = authActionClient
  .inputSchema(createWaitlistItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const waitlistItem = await createWaitlistItem(parsedInput, ctx.userName);

    return waitlistItem;
  });
