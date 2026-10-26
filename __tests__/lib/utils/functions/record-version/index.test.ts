import assert from "node:assert/strict";
import { test } from "node:test";
import { computeRecordVersion } from "../../../../../lib/utils/functions/record-version/index.ts";

const guardian = (id: string, tel: string | null = null) => ({
  id,
  firstName: "Sofie",
  lastName: "Van Damme",
  tel,
  email: null,
});

const saved = new Date("2026-10-01T09:00:00.000Z");

test("the version is stable for the same record", () => {
  assert.equal(
    computeRecordVersion(saved, [guardian("a")]),
    computeRecordVersion(saved, [guardian("a")]),
  );
});

test("the version ignores guardian order", () => {
  assert.equal(
    computeRecordVersion(saved, [guardian("a"), guardian("b")]),
    computeRecordVersion(saved, [guardian("b"), guardian("a")]),
  );
});

test("the version changes when the waitlist item was saved again", () => {
  assert.notEqual(
    computeRecordVersion(saved, [guardian("a")]),
    computeRecordVersion(new Date("2026-10-02T09:00:00.000Z"), [guardian("a")]),
  );
});

test("the version changes when a shared guardian was edited elsewhere", () => {
  assert.notEqual(
    computeRecordVersion(saved, [guardian("a", "0473 55 12 08")]),
    computeRecordVersion(saved, [guardian("a", "0498 20 71 44")]),
  );
});

test("the version changes when a guardian is linked or unlinked", () => {
  assert.notEqual(
    computeRecordVersion(saved, [guardian("a")]),
    computeRecordVersion(saved, [guardian("a"), guardian("b")]),
  );
});

test("a never-saved record has a version of its own", () => {
  assert.notEqual(
    computeRecordVersion(null, [guardian("a")]),
    computeRecordVersion(saved, [guardian("a")]),
  );
});
