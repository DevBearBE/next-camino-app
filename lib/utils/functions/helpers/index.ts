export function emptyToUndefined(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() === "" ? undefined : value;
}

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
