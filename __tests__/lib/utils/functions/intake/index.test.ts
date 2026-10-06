import assert from "node:assert/strict";
import { test } from "node:test";
import {
  intakeByRequiredMessage,
  intakeDateRequiredMessage,
  intakeRuleIssues,
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
      planningStatus: "not_planned",
      intakeAt: "2026-10-20",
      intakeBy: null,
    }),
    [{ field: "intakeBy", message: intakeByRequiredMessage }],
  );
});

test("a whitespace-only intake by counts as empty", () => {
  const issues = intakeRuleIssues({
    planningStatus: "not_planned",
    intakeAt: "2026-10-20",
    intakeBy: "   ",
  });

  assert.deepEqual(issues, [
    { field: "intakeBy", message: intakeByRequiredMessage },
  ]);
});

test("planned with a date but no intake by only flags intake by", () => {
  const issues = intakeRuleIssues({
    planningStatus: "planned",
    intakeAt: "2026-10-20",
    intakeBy: "",
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
