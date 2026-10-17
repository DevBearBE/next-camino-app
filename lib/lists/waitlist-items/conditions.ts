import {
  eq,
  gte,
  ilike,
  inArray,
  lte,
  notInArray,
  sql,
  type SQL,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { handledStatuses } from "@/lib/db/enums";
import { personsTable } from "@/lib/db/schemas/persons";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import { escapeLikePattern } from "@/lib/lists/filters";
import type { ConditionMap } from "@/lib/types/lists";
import type {
  WaitlistSortKey,
  WaitlistView,
  waitlistFilterParsers,
} from "@/lib/lists/waitlist-items/search-params";

const fullName = sql`${personsTable.firstName} || ' ' || ${personsTable.lastName}`;

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

export const waitlistConditions: ConditionMap<typeof waitlistFilterParsers> = {
  type: (value) => eq(waitlistItemsTable.waitlistType, value),
  contactStatus: (value) => eq(waitlistItemsTable.contactStatus, value),
  planningStatus: (value) => eq(waitlistItemsTable.planningStatus, value),
  q: (value) => ilike(fullName, `%${escapeLikePattern(value)}%`),
  dobFrom: (value) => gte(personsTable.dob, toDateString(value)),
  dobTo: (value) => lte(personsTable.dob, toDateString(value)),
};

export const waitlistViewCondition = (view: WaitlistView): SQL =>
  view === "handled"
    ? inArray(waitlistItemsTable.planningStatus, [...handledStatuses])
    : notInArray(waitlistItemsTable.planningStatus, [...handledStatuses]);

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
