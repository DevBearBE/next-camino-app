import type { BadgeTone } from "@/components/atoms/badges/status-badge";
import type { ContactStatus } from "@/lib/db/enums";

export const contactStatusTones: Record<ContactStatus, BadgeTone> = {
  not_contacted: "neutral",
  contacted: "warning",
  awaiting_info: "info",
  info_received: "success",
};
