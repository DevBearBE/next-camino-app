export const addGuardianId = (guardianIds: string[]): string[] => [
  ...guardianIds,
  crypto.randomUUID(),
];

export const removeGuardianId = (guardianIds: string[], id: string): string[] =>
  guardianIds.filter((existingId) => existingId !== id);

export function buildGuardianFieldErrors(
  guardiansErrors: Record<string, unknown> | undefined,
  guardianIds: string[],
): Record<string, string> {
  if (!guardiansErrors) return {};

  const entries = Object.entries(guardiansErrors).flatMap(
    ([indexKey, node]) => {
      if (indexKey === "_errors") return [];
      const id = guardianIds[Number(indexKey)];
      if (!id || !node || typeof node !== "object") return [];

      return Object.entries(node as Record<string, unknown>).flatMap(
        ([fieldName, fieldNode]) => {
          if (fieldName === "_errors") return [];
          const messages = (fieldNode as { _errors?: string[] })?._errors;
          if (!Array.isArray(messages) || messages.length === 0) return [];
          return [
            [`guardians.${id}.${fieldName}`, messages[0]] as [string, string],
          ];
        },
      );
    },
  );

  return Object.fromEntries(entries);
}
