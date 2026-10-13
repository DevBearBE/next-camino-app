import type { PlanningStatus } from "@/lib/db/enums";

export const PLANNED: PlanningStatus = "planned";

export const intakeDateRequiredMessage =
  "Intakedatum is verplicht bij planningsstatus Ingepland";
export const intakeByRequiredMessage =
  "Intake door is verplicht bij een intakedatum";
export const planningStatusMustBePlannedMessage =
  "Planningsstatus moet Ingepland zijn bij een intakedatum";
export const intakeInPastMessage = "Intakedatum mag niet in het verleden liggen";

type IntakeRuleInput = {
  readonly planningStatus: PlanningStatus;
  readonly intakeAt: string | null | undefined;
  readonly intakeBy: string | null | undefined;
};

export type IntakeRuleIssue = {
  readonly field: "intakeAt" | "intakeBy" | "planningStatus";
  readonly message: string;
};

export function planningStatusForIntake(
  intakeDate: string,
  statusWithoutIntake: PlanningStatus,
): PlanningStatus {
  return intakeDate ? PLANNED : statusWithoutIntake;
}

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
    ...(hasIntakeDate && planningStatus !== PLANNED
      ? [
          {
            field: "planningStatus" as const,
            message: planningStatusMustBePlannedMessage,
          },
        ]
      : []),
  ];
}
