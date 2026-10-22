import type { ContactStatus } from "@/lib/db/enums";

export const contactStatusLabels: Record<ContactStatus, string> = {
  not_contacted: "Niet gecontacteerd",
  contacted: "Gecontacteerd",
  awaiting_info: "Wacht op info",
};
