import { db } from "@/lib/db/drizzle";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import { buildWhere, defineSort } from "@/lib/lists/filters";
import {
  PAGE_SIZE,
  clampPage,
  toOffset,
  toPageCount,
} from "@/lib/lists/pagination";
import type { ListResult } from "@/lib/types/lists";
import {
  waitlistConditions,
  waitlistSortColumns,
  waitlistSortTiebreaker,
} from "@/lib/lists/waitlist-items/conditions";
import type {
  WaitlistParams,
  WaitlistSortKey,
} from "@/lib/lists/waitlist-items/search-params";
import { type WaitlistRow } from "@/lib/types/waitlist-items";
import { count, eq } from "drizzle-orm";

const waitlistSort = defineSort(waitlistSortColumns, waitlistSortTiebreaker);

const onRegistration = eq(
  waitlistItemsTable.registrationId,
  registrationsTable.id,
);
const onPatient = eq(registrationsTable.patientId, personsTable.id);

export async function findWaitlistItems(
  params: WaitlistParams,
): Promise<ListResult<WaitlistRow, WaitlistSortKey>> {
  const where = buildWhere(waitlistConditions, params);
  const sort = { sort: params.sort, dir: params.dir } as const;

  const [{ total }] = await db
    .select({ total: count() })
    .from(waitlistItemsTable)
    .innerJoin(registrationsTable, onRegistration)
    .innerJoin(personsTable, onPatient)
    .where(where);

  const pageCount = toPageCount(total, PAGE_SIZE);
  const page = clampPage(params.page, pageCount);

  if (total === 0) return { rows: [], total, page, pageCount, sort };

  const rows = await db
    .select({
      id: waitlistItemsTable.id,
      firstName: personsTable.firstName,
      lastName: personsTable.lastName,
      dob: personsTable.dob,
      waitlistType: waitlistItemsTable.waitlistType,
      contactStatus: waitlistItemsTable.contactStatus,
      planningStatus: waitlistItemsTable.planningStatus,
      registeredOn: waitlistItemsTable.createdAt,
      intakeAt: waitlistItemsTable.intakeAt,
    })
    .from(waitlistItemsTable)
    .innerJoin(registrationsTable, onRegistration)
    .innerJoin(personsTable, onPatient)
    .where(where)
    .orderBy(...waitlistSort.toOrderBy(params.sort, params.dir))
    .limit(PAGE_SIZE)
    .offset(toOffset(page, PAGE_SIZE));

  return { rows, total, page, pageCount, sort };
}
