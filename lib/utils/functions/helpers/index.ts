// form functions
export function emptyToUndefined(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() === "" ? undefined : value;
}

// format functions
export function formatFullName(person: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  return [person.firstName, person.lastName].filter(Boolean).join(" ");
}
