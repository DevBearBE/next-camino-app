import assert from "node:assert/strict";
import { test } from "node:test";
import {
  intakeByRequiredMessage,
  intakeDateRequiredMessage,
  intakeRuleIssues,
  planningStatusForIntake,
  planningStatusMustBePlannedMessage,
} from "../../../../../lib/utils/functions/intake/index.ts";

test("planned requires an intake date", () => {
  assert.deepEqual(
    intakeRuleIssues({
      planningStatus: "planned",
      intakeAt: null,
      intakeBy: null,
    }),
    [{ field: "intakeAt", message: intakeDateRequiredMessage }],
  );
});

test("an intake date requires a filled-in intake by", () => {
  assert.deepEqual(
    intakeRuleIssues({
      planningStatus: "planned",
      intakeAt: "2026-10-20",
      intakeBy: null,
    }),
    [{ field: "intakeBy", message: intakeByRequiredMessage }],
  );
});

test("a whitespace-only intake by counts as empty", () => {
  const issues = intakeRuleIssues({
    planningStatus: "planned",
    intakeAt: "2026-10-20",
    intakeBy: "   ",
  });

  assert.deepEqual(issues, [
    { field: "intakeBy", message: intakeByRequiredMessage },
  ]);
});

test("planned without date and without intake by only flags the date", () => {
  const issues = intakeRuleIssues({
    planningStatus: "planned",
    intakeAt: undefined,
    intakeBy: undefined,
  });

  assert.deepEqual(issues, [
    { field: "intakeAt", message: intakeDateRequiredMessage },
  ]);
});

test("an intake date only allows planned", () => {
  const issues = intakeRuleIssues({
    planningStatus: "on_hold",
    intakeAt: "2026-10-20",
    intakeBy: "Lien Peeters",
  });

  assert.deepEqual(issues, [
    { field: "planningStatus", message: planningStatusMustBePlannedMessage },
  ]);
});

test("all rules can fail at once", () => {
  const issues = intakeRuleIssues({
    planningStatus: "not_planned",
    intakeAt: "2026-10-20",
    intakeBy: "",
  });

  assert.deepEqual(
    issues.map((issue) => issue.field),
    ["intakeBy", "planningStatus"],
  );
});

test("no date and a status other than planned is fine", () => {
  assert.deepEqual(
    intakeRuleIssues({
      planningStatus: "on_hold",
      intakeAt: null,
      intakeBy: null,
    }),
    [],
  );
});

test("a complete planned intake has no issues", () => {
  assert.deepEqual(
    intakeRuleIssues({
      planningStatus: "planned",
      intakeAt: "2026-10-20",
      intakeBy: "Lien Peeters",
    }),
    [],
  );
});

test("setting an intake date forces planned", () => {
  assert.equal(planningStatusForIntake("2026-10-20", "not_planned"), "planned");
  assert.equal(planningStatusForIntake("2026-10-20", "on_hold"), "planned");
});

test("without an intake date the chosen status stays", () => {
  assert.equal(planningStatusForIntake("", "not_planned"), "not_planned");
  assert.equal(planningStatusForIntake("", "planned"), "planned");
});
