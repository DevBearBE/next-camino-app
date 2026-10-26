import type { BadgeTone } from "@/components/atoms/badges/status-badge";
import type { ContactStatus } from "@/lib/db/enums";

export const contactStatusTones: Record<ContactStatus, BadgeTone> = {
  not_contacted: "danger",
  awaiting_info: "info",
  contacted: "success",
};
