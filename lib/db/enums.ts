import type { WaitlistView } from "@/lib/lists/waitlist-items/search-params";

export const registrationMethodValues = ["mail", "phone"] as const;

export const waitlistTypeValues = [
  "diagnostics",
  "psychological_support",
  "child_psychiatric_support",
] as const;

export const contactStatusValues = [
  "not_contacted",
  "awaiting_info",
  "contacted",
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

export const planningStatusView = {
  not_planned: "active",
  planned: "handled",
  on_hold: "active",
  no_longer_needed: "handled",
} as const satisfies Record<PlanningStatus, WaitlistView>;

export const handledStatuses = planningStatusValues.filter(
  (status) => planningStatusView[status] === "handled",
);

export const isStatusInView = (status: string, view: WaitlistView): boolean =>
  planningStatusView[status as PlanningStatus] === view;
