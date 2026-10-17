import assert from "node:assert/strict";
import { test } from "node:test";
import {
  handledStatuses,
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
