import { createSafeActionClient } from "next-safe-action";
import { auth, currentUser } from "@clerk/nextjs/server";
import { formatFullName } from "@/lib/utils/functions/helpers";

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error(
      "U bent heeft niet de juiste rechten om deze actie uit te voeren",
    ); // "Unauthorized"
  }

  const user = await currentUser();

  return next({
    ctx: {
      userId,
      userName: user ? formatFullName(user) : "",
    },
  });
});
