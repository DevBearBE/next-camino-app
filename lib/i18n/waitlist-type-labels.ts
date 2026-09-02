import { waitlistTypeEnum } from "@/lib/db/schemas/waitlist-items";

export const waitlistTypeLabels: Record<
  (typeof waitlistTypeEnum.enumValues)[number],
  string
> = {
  diagnostics: "Diagnostiek",
  psychological_support: "Psychologische begeleiding",
  child_psychiatric_support: "Kinderpsychiatrische begeleiding",
};
