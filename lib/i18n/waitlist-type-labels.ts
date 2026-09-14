import type { WaitlistType } from "@/lib/db/enums";

export const waitlistTypeLabels: Record<WaitlistType, string> = {
  diagnostics: "Diagnostiek",
  psychological_support: "Psychologische begeleiding",
  child_psychiatric_support: "Kinderpsychiatrische begeleiding",
};
