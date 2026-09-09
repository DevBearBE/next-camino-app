export const registrationMethodValues = ["mail", "phone"] as const;

export const waitlistTypeValues = [
  "diagnostics",
  "psychological_support",
  "child_psychiatric_support",
] as const;

export const contactStatusValues = [
  "not_contacted",
  "contacted",
  "awaiting_info",
  "info_received",
] as const;

export const planningStatusValues = [
  "not_planned",
  "planned",
  "on_hold",
  "no_longer_needed",
] as const;

export type RegistrationMethod = (typeof registrationMethodValues)[number];
export type WaitlistType = (typeof waitlistTypeValues)[number];
export type ContactStatus = (typeof contactStatusValues)[number];
export type PlanningStatus = (typeof planningStatusValues)[number];
