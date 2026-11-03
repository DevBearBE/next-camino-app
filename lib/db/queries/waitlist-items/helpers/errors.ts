import { DrizzleQueryError } from "drizzle-orm";

const UNIQUE_VIOLATION = "23505";
const TYPE_TAKEN_CONSTRAINT = "waitlist_items_patient_id_waitlist_type_unique";

export function isTypeTakenViolation(error: unknown): boolean {
  if (!(error instanceof DrizzleQueryError)) return false;

  const cause = error.cause as
    | { code?: string; constraint?: string }
    | undefined;

  return (
    cause?.code === UNIQUE_VIOLATION &&
    cause.constraint === TYPE_TAKEN_CONSTRAINT
  );
}
