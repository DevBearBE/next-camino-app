import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_VALUE,
  emptyToUndefined,
  formatDate,
  formatFullName,
  formatIsoDate,
  formatWaitingTime,
} from "./index.ts";

test("emptyToUndefined drops blank and whitespace-only values", () => {
  assert.equal(emptyToUndefined(""), undefined);
  assert.equal(emptyToUndefined("   "), undefined);
  assert.equal(emptyToUndefined(null), undefined);
  assert.equal(emptyToUndefined("jan"), "jan");
});

test("formatFullName skips missing parts", () => {
  assert.equal(
    formatFullName({ firstName: "Jan", lastName: "Peeters" }),
    "Jan Peeters",
  );
  assert.equal(formatFullName({ firstName: "Jan", lastName: null }), "Jan");
  assert.equal(formatFullName({}), "");
});

test("formatDate renders Belgian day-first dates", () => {
  assert.equal(formatDate(new Date(Date.UTC(2026, 8, 9))), "09/09/2026");
});

test("formatDate falls back for a missing date", () => {
  assert.equal(formatDate(null), EMPTY_VALUE);
  assert.equal(formatDate(undefined), EMPTY_VALUE);
});

test("formatIsoDate reorders without constructing a Date", () => {
  assert.equal(formatIsoDate("2026-09-09"), "09/09/2026");
  assert.equal(formatIsoDate("1998-01-31"), "31/01/1998");
});

test("formatIsoDate does not shift the day across timezones", () => {
  const previousTZ = process.env.TZ;
  process.env.TZ = "Pacific/Kiritimati";
  assert.equal(formatIsoDate("2026-01-01"), "01/01/2026");
  process.env.TZ = previousTZ;
});

test("formatIsoDate falls back for missing or malformed input", () => {
  assert.equal(formatIsoDate(null), EMPTY_VALUE);
  assert.equal(formatIsoDate(""), EMPTY_VALUE);
  assert.equal(formatIsoDate("2026-09"), EMPTY_VALUE);
});

const at = (iso: string) => new Date(`${iso}T00:00:00Z`);

test("formatWaitingTime reports whole weeks under a year", () => {
  assert.equal(formatWaitingTime(at("2026-08-26"), at("2026-09-09")), "2 wk");
  assert.equal(formatWaitingTime(at("2026-03-04"), at("2026-09-09")), "27 wk");
});

test("formatWaitingTime collapses the first week", () => {
  assert.equal(formatWaitingTime(at("2026-09-09"), at("2026-09-09")), "< 1 wk");
  assert.equal(formatWaitingTime(at("2026-09-03"), at("2026-09-09")), "< 1 wk");
  assert.equal(formatWaitingTime(at("2026-09-02"), at("2026-09-09")), "1 wk");
});

test("formatWaitingTime switches to years and months past a year", () => {
  assert.equal(formatWaitingTime(at("2025-09-09"), at("2026-09-09")), "1 j");
  assert.equal(
    formatWaitingTime(at("2025-06-09"), at("2026-09-09")),
    "1 j 3 mnd",
  );
  assert.equal(formatWaitingTime(at("2024-09-09"), at("2026-09-09")), "2 j");
});

test("formatWaitingTime never goes negative for a future date", () => {
  assert.equal(formatWaitingTime(at("2027-01-01"), at("2026-09-09")), "< 1 wk");
});

test("formatWaitingTime falls back for a missing date", () => {
  assert.equal(formatWaitingTime(null), EMPTY_VALUE);
});
