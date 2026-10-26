export type GuardianFormRow = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly tel: string;
  readonly email: string;
};

export function extractGuardiansFromFormData(
  formData: FormData,
  guardianIds: readonly string[],
): GuardianFormRow[] {
  const field = (id: string, name: string): string => {
    const value = formData.get(`guardians.${id}.${name}`);
    return typeof value === "string" ? value : "";
  };

  return guardianIds.map((id) => ({
    id,
    firstName: field(id, "firstName"),
    lastName: field(id, "lastName"),
    tel: field(id, "tel"),
    email: field(id, "email"),
  }));
}

type IdentifiedRow = { readonly id: string };

export type GuardianSyncPlan<TRow extends IdentifiedRow> = {
  readonly toUpdate: readonly TRow[];
  readonly toLink: readonly TRow[];
  readonly toUnlink: readonly string[];
};

export function planGuardianSync<TRow extends IdentifiedRow>(
  linkedIds: readonly string[],
  payload: readonly TRow[],
  patientId: string,
): GuardianSyncPlan<TRow> {
  const linked = new Set(linkedIds);
  const uniqueRows = Array.from(
    new Map(
      payload
        .filter((row) => row.id !== patientId)
        .map((row) => [row.id, row] as const),
    ).values(),
  );
  const keptIds = new Set(uniqueRows.map((row) => row.id));

  return {
    toUpdate: uniqueRows.filter((row) => linked.has(row.id)),
    toLink: uniqueRows.filter((row) => !linked.has(row.id)),
    toUnlink: linkedIds.filter((id) => !keptIds.has(id)),
  };
}
