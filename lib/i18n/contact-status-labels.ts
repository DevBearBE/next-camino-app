import type { ContactStatus } from "@/lib/db/enums";

export const contactStatusLabels: Record<ContactStatus, string> = {
  not_contacted: "Niet gecontacteerd",
  awaiting_info: "Wachten op antwoord",
  contacted: "Gecontacteerd",
};
