import { format, isValid, parse } from "date-fns";

export function emptyToUndefined(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() === "" ? undefined : value;
}

export function emptyToNull(value: FormDataEntryValue | null): string | null {
  return emptyToUndefined(value) ?? null;
}

export function formatFullName(person: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  return [person.firstName, person.lastName].filter(Boolean).join(" ");
}

export function formatInitials(person: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  return formatFullName(person)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export const EMPTY_VALUE = "—";

export function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "patient";
}

const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";
const ISO_DATE_FORMAT = "yyyy-MM-dd";

export function formatDate(value: Date | null | undefined): string {
  return value ? format(value, DISPLAY_DATE_FORMAT) : EMPTY_VALUE;
}

export function formatIsoDate(value: string | null | undefined): string {
  const date = parse(value ?? "", ISO_DATE_FORMAT, new Date());

  return isValid(date) ? formatDate(date) : EMPTY_VALUE;
}

const BRUSSELS_TIME_ZONE = "Europe/Brussels";

const isoDayInBrussels = new Intl.DateTimeFormat("en-CA", {
  timeZone: BRUSSELS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isBeforeToday(
  isoDate: string,
  now: Date = new Date(),
): boolean {
  return isoDate < isoDayInBrussels.format(now);
}

export function toDateInputValue(value: Date | null | undefined): string {
  return value ? format(value, ISO_DATE_FORMAT) : "";
}
