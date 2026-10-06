const GUARDIAN_FIELD_KEY = /^guardians\.([^.]+)\.(.+)$/;

export type GuardianFormRow = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly tel: string;
  readonly email: string;
};

export function extractGuardiansFromFormData(
  formData: FormData,
): GuardianFormRow[] {
  const guardianEntries = Array.from(formData.entries()).flatMap(
    ([key, value]) => {
      const match = key.match(GUARDIAN_FIELD_KEY);
      if (!match || typeof value !== "string") return [];
      const [, rowId, fieldName] = match;
      return [{ rowId, fieldName, value }];
    },
  );

  const fieldsByGuardian = guardianEntries.reduce<
    Record<string, Record<string, string>>
  >(
    (acc, { rowId, fieldName, value }) => ({
      ...acc,
      [rowId]: { ...acc[rowId], [fieldName]: value },
    }),
    {},
  );

  return Object.entries(fieldsByGuardian).map(([id, fields]) => ({
    id,
    firstName: fields.firstName ?? "",
    lastName: fields.lastName ?? "",
    tel: fields.tel ?? "",
    email: fields.email ?? "",
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
