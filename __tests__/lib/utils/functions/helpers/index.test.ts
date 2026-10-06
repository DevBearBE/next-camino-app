import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_VALUE,
  emptyToNull,
  emptyToUndefined,
  formatDate,
  formatFullName,
  formatIsoDate,
  formatWaitingTime,
  isBeforeToday,
  slugify,
  toDateInputValue,
} from "../../../../../lib/utils/functions/helpers/index.ts";

test("emptyToUndefined drops blank and whitespace-only values", () => {
  assert.equal(emptyToUndefined(""), undefined);
  assert.equal(emptyToUndefined("   "), undefined);
  assert.equal(emptyToUndefined(null), undefined);
  assert.equal(emptyToUndefined("jan"), "jan");
});

test("emptyToNull turns blank values into null so a cleared field is cleared", () => {
  assert.equal(emptyToNull(""), null);
  assert.equal(emptyToNull("   "), null);
  assert.equal(emptyToNull(null), null);
  assert.equal(emptyToNull("jan"), "jan");
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

test("slugify lowercases and hyphenates", () => {
  assert.equal(slugify("Jan Peeters"), "jan-peeters");
});

test("slugify strips diacritics", () => {
  assert.equal(slugify("Zoë Hélène"), "zoe-helene");
});

test("slugify collapses punctuation to a single hyphen", () => {
  assert.equal(slugify("D'Haese  Van-Acker"), "d-haese-van-acker");
});

test("slugify falls back for an empty result", () => {
  assert.equal(slugify(""), "patient");
  assert.equal(slugify("---"), "patient");
});

test("toDateInputValue formats an ISO date-input string", () => {
  assert.equal(toDateInputValue(new Date(2026, 8, 9)), "2026-09-09");
});

test("toDateInputValue falls back to an empty string for a missing date", () => {
  assert.equal(toDateInputValue(null), "");
  assert.equal(toDateInputValue(undefined), "");
});

test("toDateInputValue reads the local calendar date, not UTC", () => {
  const previousTZ = process.env.TZ;
  process.env.TZ = "Pacific/Kiritimati";
  assert.equal(
    toDateInputValue(new Date(Date.UTC(2026, 8, 9, 23, 30))),
    "2026-09-10",
  );
  process.env.TZ = previousTZ;
});

test("isBeforeToday compares against the Brussels calendar day", () => {
  const justPastMidnightInBrussels = new Date("2026-10-06T22:30:00Z");

  assert.equal(isBeforeToday("2026-10-06", justPastMidnightInBrussels), true);
  assert.equal(isBeforeToday("2026-10-07", justPastMidnightInBrussels), false);
  assert.equal(isBeforeToday("2026-10-08", justPastMidnightInBrussels), false);
});

test("isBeforeToday handles winter time and the year boundary", () => {
  const newYearInBrussels = new Date("2026-12-31T23:30:00Z");

  assert.equal(isBeforeToday("2026-12-31", newYearInBrussels), true);
  assert.equal(isBeforeToday("2027-01-01", newYearInBrussels), false);
});
