import { planningStatusEnum } from "@/lib/db/schemas/waitlist-items";

export const planningStatusLabels: Record<
  (typeof planningStatusEnum.enumValues)[number],
  string
> = {
  not_planned: "Niet ingepland",
  planned: "Ingepland",
  on_hold: "On hold",
  no_longer_needed: "Niet meer nodig",
};
