import assert from "node:assert/strict";
import { test } from "node:test";
import {
  availableWaitlistTypes,
  pickPrefillSource,
} from "../../../../../lib/utils/functions/children/index.ts";

const all = [
  "diagnostics",
  "psychological_support",
  "child_psychiatric_support",
] as const;

const registration = (id: string, createdAt: Date | null) => ({
  id,
  createdAt,
});

test("pickPrefillSource picks the most recently created registration", () => {
  const oldest = registration("a", new Date("2026-01-01T09:00:00.000Z"));
  const newest = registration("b", new Date("2026-03-01T09:00:00.000Z"));
  const middle = registration("c", new Date("2026-02-01T09:00:00.000Z"));

  assert.equal(pickPrefillSource([oldest, newest, middle]), newest);
});

test("pickPrefillSource returns undefined for an empty list", () => {
  assert.equal(pickPrefillSource([]), undefined);
});

test("pickPrefillSource prefers a dated registration over a null date", () => {
  const undated = registration("a", null);
  const dated = registration("b", new Date("2026-01-01T09:00:00.000Z"));

  assert.equal(pickPrefillSource([undated, dated]), dated);
});

test("pickPrefillSource does not reorder its input", () => {
  const first = registration("a", new Date("2026-01-01T09:00:00.000Z"));
  const second = registration("b", new Date("2026-02-01T09:00:00.000Z"));
  const input = [first, second];

  pickPrefillSource(input);

  assert.deepEqual(input, [first, second]);
});

test("availableWaitlistTypes returns every type when none is taken", () => {
  assert.deepEqual(availableWaitlistTypes(all, []), [...all]);
});

test("availableWaitlistTypes leaves out the taken types in the original order", () => {
  assert.deepEqual(availableWaitlistTypes(all, ["psychological_support"]), [
    "diagnostics",
    "child_psychiatric_support",
  ]);
});

test("availableWaitlistTypes returns nothing when every type is taken", () => {
  assert.deepEqual(availableWaitlistTypes(all, [...all]), []);
});
