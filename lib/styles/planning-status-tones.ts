import type { BadgeTone } from "@/components/atoms/badges/status-badge";
import type { PlanningStatus } from "@/lib/db/enums";

export const planningStatusTones: Record<PlanningStatus, BadgeTone> = {
  not_planned: "danger",
  planned: "success",
  on_hold: "info",
  no_longer_needed: "success",
};
