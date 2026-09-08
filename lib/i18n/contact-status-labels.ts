import { contactStatusEnum } from "@/lib/db/schemas/waitlist-items";

export const contactStatusLabels: Record<
  (typeof contactStatusEnum.enumValues)[number],
  string
> = {
  not_contacted: "Niet gecontacteerd",
  contacted: "Gecontacteerd",
  awaiting_info: "Wacht op info",
};
