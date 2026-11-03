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

const patient = {
  firstName: "Noor",
  lastName: "Janssens",
  dob: "2016-03-14",
  tel: null,
  email: null,
};

const saved = new Date("2026-10-01T09:00:00.000Z");

test("the version is stable for the same record", () => {
  assert.equal(
    computeRecordVersion(saved, patient, [guardian("a")]),
    computeRecordVersion(saved, patient, [guardian("a")]),
  );
});

test("the version ignores guardian order", () => {
  assert.equal(
    computeRecordVersion(saved, patient, [guardian("a"), guardian("b")]),
    computeRecordVersion(saved, patient, [guardian("b"), guardian("a")]),
  );
});

test("the version changes when the waitlist item was saved again", () => {
  assert.notEqual(
    computeRecordVersion(saved, patient, [guardian("a")]),
    computeRecordVersion(new Date("2026-10-02T09:00:00.000Z"), patient, [
      guardian("a"),
    ]),
  );
});

test("the version changes when a shared guardian was edited elsewhere", () => {
  assert.notEqual(
    computeRecordVersion(saved, patient, [guardian("a", "0473 55 12 08")]),
    computeRecordVersion(saved, patient, [guardian("a", "0498 20 71 44")]),
  );
});

test("the version changes when a guardian is linked or unlinked", () => {
  assert.notEqual(
    computeRecordVersion(saved, patient, [guardian("a")]),
    computeRecordVersion(saved, patient, [guardian("a"), guardian("b")]),
  );
});

test("a never-saved record has a version of its own", () => {
  assert.notEqual(
    computeRecordVersion(null, patient, [guardian("a")]),
    computeRecordVersion(saved, patient, [guardian("a")]),
  );
});

test("the version changes when the child was edited from another entry", () => {
  assert.notEqual(
    computeRecordVersion(saved, patient, [guardian("a")]),
    computeRecordVersion(saved, { ...patient, firstName: "Nora" }, [
      guardian("a"),
    ]),
  );
});

test("the version changes for each personal detail of the child", () => {
  const base = computeRecordVersion(saved, patient, []);

  for (const change of [
    { lastName: "Peeters" },
    { dob: "2016-03-15" },
    { tel: "0470 12 34 56" },
    { email: "noor@mail.be" },
  ]) {
    assert.notEqual(
      base,
      computeRecordVersion(saved, { ...patient, ...change }, []),
    );
  }
});
