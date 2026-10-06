import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractGuardiansFromFormData,
  planGuardianSync,
} from "../../../../../lib/utils/functions/guardians/index.ts";

const row = (id: string) => ({ id, firstName: id });
const PATIENT = "patient";

test("extractGuardiansFromFormData keeps row ids and field order", () => {
  const formData = new FormData();
  formData.set("firstName", "Amber");
  formData.set("guardians.a.firstName", "Sofie");
  formData.set("guardians.a.lastName", "Van Damme");
  formData.set("guardians.a.tel", "0473 55 12 08");
  formData.set("guardians.a.email", "sofie@mail.be");
  formData.set("guardians.b.firstName", "Tom");

  assert.deepEqual(extractGuardiansFromFormData(formData), [
    {
      id: "a",
      firstName: "Sofie",
      lastName: "Van Damme",
      tel: "0473 55 12 08",
      email: "sofie@mail.be",
    },
    { id: "b", firstName: "Tom", lastName: "", tel: "", email: "" },
  ]);
});

test("extractGuardiansFromFormData keeps blank fields as empty strings", () => {
  const formData = new FormData();
  formData.set("guardians.a.firstName", "Sofie");
  formData.set("guardians.a.tel", "");

  const [guardian] = extractGuardiansFromFormData(formData);

  assert.equal(guardian.tel, "");
  assert.equal(guardian.email, "");
});

test("extractGuardiansFromFormData returns nothing without guardian fields", () => {
  const formData = new FormData();
  formData.set("firstName", "Amber");

  assert.deepEqual(extractGuardiansFromFormData(formData), []);
});

test("planGuardianSync updates linked guardians and links new ones", () => {
  const plan = planGuardianSync(["a"], [row("a"), row("new")], PATIENT);

  assert.deepEqual(plan.toUpdate, [row("a")]);
  assert.deepEqual(plan.toLink, [row("new")]);
  assert.deepEqual(plan.toUnlink, []);
});

test("planGuardianSync unlinks guardians missing from the payload", () => {
  const plan = planGuardianSync(["a", "b"], [row("a")], PATIENT);

  assert.deepEqual(plan.toUpdate, [row("a")]);
  assert.deepEqual(plan.toUnlink, ["b"]);
});

test("planGuardianSync unlinks everyone for an empty payload", () => {
  const plan = planGuardianSync(["a", "b"], [], PATIENT);

  assert.deepEqual(plan.toUpdate, []);
  assert.deepEqual(plan.toLink, []);
  assert.deepEqual(plan.toUnlink, ["a", "b"]);
});

test("planGuardianSync never updates a person that is not linked", () => {
  const plan = planGuardianSync(["a"], [row("sibling-guardian")], PATIENT);

  assert.deepEqual(plan.toUpdate, []);
  assert.deepEqual(plan.toLink, [row("sibling-guardian")]);
});

test("planGuardianSync collapses duplicate ids to one row", () => {
  const plan = planGuardianSync(["a"], [row("a"), row("a"), row("n"), row("n")], PATIENT);

  assert.equal(plan.toUpdate.length, 1);
  assert.equal(plan.toLink.length, 1);
});

test("planGuardianSync never touches the patient and drops a bad patient link", () => {
  const plan = planGuardianSync([PATIENT, "a"], [row(PATIENT), row("a")], PATIENT);

  assert.deepEqual(plan.toUpdate, [row("a")]);
  assert.deepEqual(plan.toLink, []);
  assert.deepEqual(plan.toUnlink, [PATIENT]);
});
