import { createHash } from "node:crypto";

type VersionedPatient = {
  readonly firstName: string;
  readonly lastName: string;
  readonly dob: string | null;
  readonly tel: string | null;
  readonly email: string | null;
};

type VersionedGuardian = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly tel: string | null;
  readonly email: string | null;
};

const byId = (a: VersionedGuardian, b: VersionedGuardian): number =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

export function computeRecordVersion(
  updatedAt: Date | null,
  patient: VersionedPatient,
  guardians: readonly VersionedGuardian[],
): string {
  const patientFields = [
    patient.firstName,
    patient.lastName,
    patient.dob,
    patient.tel,
    patient.email,
  ];
  const guardianFields = [...guardians]
    .sort(byId)
    .map(({ id, firstName, lastName, tel, email }) => [
      id,
      firstName,
      lastName,
      tel,
      email,
    ]);

  return createHash("sha256")
    .update(
      JSON.stringify([
        updatedAt?.toISOString() ?? "",
        patientFields,
        guardianFields,
      ]),
    )
    .digest("hex");
}
