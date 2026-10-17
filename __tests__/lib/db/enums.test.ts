import assert from "node:assert/strict";
import { test } from "node:test";
import {
  handledStatuses,
  isStatusInView,
  planningStatusValues,
  planningStatusView,
} from "../../../lib/db/enums.ts";

test("handled statuses are planned and no longer needed", () => {
  assert.deepEqual(handledStatuses, ["planned", "no_longer_needed"]);
});

test("every planning status is mapped to a view", () => {
  assert.deepEqual(
    Object.keys(planningStatusView).sort(),
    [...planningStatusValues].sort(),
  );
});

test("isStatusInView puts an unknown status in neither view", () => {
  assert.equal(isStatusInView("unknown", "active"), false);
  assert.equal(isStatusInView("unknown", "handled"), false);
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
