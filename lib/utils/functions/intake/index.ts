import type { PlanningStatus } from "@/lib/db/enums";

const PLANNED: PlanningStatus = "planned";

export const intakeDateRequiredMessage =
  "Intakedatum is verplicht bij planningsstatus Ingepland";
export const intakeByRequiredMessage =
  "Intake door is verplicht bij een intakedatum";

type IntakeRuleInput = {
  readonly planningStatus: PlanningStatus;
  readonly intakeAt: string | null | undefined;
  readonly intakeBy: string | null | undefined;
};

export type IntakeRuleIssue = {
  readonly field: "intakeAt" | "intakeBy";
  readonly message: string;
};

export function intakeRuleIssues({
  planningStatus,
  intakeAt,
  intakeBy,
}: IntakeRuleInput): IntakeRuleIssue[] {
  const hasIntakeDate = Boolean(intakeAt);

  return [
    ...(planningStatus === PLANNED && !hasIntakeDate
      ? [{ field: "intakeAt" as const, message: intakeDateRequiredMessage }]
      : []),
    ...(hasIntakeDate && !intakeBy?.trim()
      ? [{ field: "intakeBy" as const, message: intakeByRequiredMessage }]
      : []),
  ];
}
