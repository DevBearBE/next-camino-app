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
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = 30;

const toUtcDay = (value: Date): number =>
  Math.floor(
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) /
      MS_PER_DAY,
  );

export function formatWaitingTime(
  from: Date | null | undefined,
  now: Date = new Date(),
): string {
  if (!from) return EMPTY_VALUE;

  const days = Math.max(toUtcDay(now) - toUtcDay(from), 0);

  if (days < DAYS_PER_WEEK) return "< 1 wk";
  if (days < DAYS_PER_YEAR) return `${Math.floor(days / DAYS_PER_WEEK)} wk`;

  const years = Math.floor(days / DAYS_PER_YEAR);
  const months = Math.floor((days % DAYS_PER_YEAR) / DAYS_PER_MONTH);

  return months > 0 ? `${years} j ${months} mnd` : `${years} j`;
}
