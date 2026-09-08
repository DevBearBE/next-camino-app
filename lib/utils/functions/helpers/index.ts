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

export const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(value: Date | null | undefined): string {
  return value ? dateFormatter.format(value) : EMPTY_VALUE;
}

export function formatIsoDate(value: string | null | undefined): string {
  const [year, month, day] = (value ?? "").split("-");

  return year && month && day ? `${day}/${month}/${year}` : EMPTY_VALUE;
}
