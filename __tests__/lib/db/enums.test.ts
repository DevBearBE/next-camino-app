import assert from "node:assert/strict";
import { test } from "node:test";
import {
  handledStatuses,
  isStatusInView,
  planningStatusValues,
} from "../../../lib/db/enums.ts";

test("handled statuses are planned and no longer needed", () => {
  assert.deepEqual(handledStatuses, ["planned", "no_longer_needed"]);
});

test("every handled status is a planning status", () => {
  for (const status of handledStatuses) {
    assert.ok(planningStatusValues.includes(status));
  }
});

test("isStatusInView places each planning status in exactly one view", () => {
  for (const status of planningStatusValues) {
    assert.notEqual(
      isStatusInView(status, "active"),
      isStatusInView(status, "handled"),
    );
  }
});

test("isStatusInView puts open statuses in active and closed ones in handled", () => {
  assert.equal(isStatusInView("not_planned", "active"), true);
  assert.equal(isStatusInView("on_hold", "active"), true);
  assert.equal(isStatusInView("planned", "handled"), true);
  assert.equal(isStatusInView("no_longer_needed", "handled"), true);
  assert.equal(isStatusInView("planned", "active"), false);
  assert.equal(isStatusInView("on_hold", "handled"), false);
});
