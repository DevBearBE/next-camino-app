import type { PlanningStatus } from "@/lib/db/enums";

export const planningStatusLabels: Record<PlanningStatus, string> = {
  not_planned: "Niet ingepland",
  planned: "Ingepland",
  on_hold: "On hold",
  no_longer_needed: "Niet meer nodig",
};
