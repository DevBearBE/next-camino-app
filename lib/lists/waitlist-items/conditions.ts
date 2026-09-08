import { eq, gte, ilike, lt, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { personsTable } from "@/lib/db/schemas/persons";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import { escapeLikePattern } from "@/lib/lists/filters";
import type { ConditionMap } from "@/lib/lists/types";
import type {
  WaitlistSortKey,
  waitlistFilterParsers,
} from "@/lib/lists/waitlist-items/search-params";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dayAfter = (date: Date): Date => new Date(date.getTime() + MS_PER_DAY);

const fullName = sql`${personsTable.firstName} || ' ' || ${personsTable.lastName}`;

export const waitlistConditions: ConditionMap<typeof waitlistFilterParsers> = {
  type: (value) => eq(waitlistItemsTable.waitlistType, value),
  contactStatus: (value) => eq(waitlistItemsTable.contactStatus, value),
  planningStatus: (value) => eq(waitlistItemsTable.planningStatus, value),
  q: (value) => ilike(fullName, `%${escapeLikePattern(value)}%`),
  from: (value) => gte(waitlistItemsTable.createdAt, value),
  to: (value) => lt(waitlistItemsTable.createdAt, dayAfter(value)),
};

export const waitlistSortColumns: Readonly<Record<WaitlistSortKey, PgColumn>> =
  {
    createdAt: waitlistItemsTable.createdAt,
    lastName: personsTable.lastName,
    waitlistType: waitlistItemsTable.waitlistType,
    contactStatus: waitlistItemsTable.contactStatus,
    planningStatus: waitlistItemsTable.planningStatus,
    intakeAt: waitlistItemsTable.intakeAt,
    dob: personsTable.dob,
  };

export const waitlistSortTiebreaker = waitlistItemsTable.id;
