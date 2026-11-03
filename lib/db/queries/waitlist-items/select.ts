import { and, asc, count, eq, ne, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db/drizzle";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import { buildWhere, defineSort } from "@/lib/lists/filters";
import {
  clampPage,
  PAGE_SIZE,
  toOffset,
  toPageCount,
} from "@/lib/lists/pagination";
import {
  waitlistConditions,
  waitlistSortColumns,
  waitlistSortTiebreaker,
  waitlistViewCondition,
} from "@/lib/lists/waitlist-items/conditions";
import type {
  WaitlistParams,
  WaitlistSortKey,
  WaitlistView,
} from "@/lib/lists/waitlist-items/search-params";
import type { ListResult, SortState } from "@/lib/types/lists";
import type {
  WaitlistItemDetail,
  WaitlistRow,
} from "@/lib/types/waitlist-items";

const waitlistSort = defineSort(waitlistSortColumns, waitlistSortTiebreaker);

const onRegistration = eq(
  waitlistItemsTable.registrationId,
  registrationsTable.id,
);
const onPatient = eq(registrationsTable.patientId, personsTable.id);

const defaultSort: SortState<WaitlistSortKey> = {
  sort: "createdAt",
  dir: "desc",
};

export async function findWaitlistItems(
  params: WaitlistParams,
): Promise<ListResult<WaitlistRow, WaitlistSortKey>> {
  const where = and(
    buildWhere(waitlistConditions, params),
    waitlistViewCondition(params.view),
  );
  const sort: SortState<WaitlistSortKey> = params.sort
    ? { sort: params.sort, dir: params.dir ?? "desc" }
    : defaultSort;

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
      patientId: personsTable.id,
      firstName: personsTable.firstName,
      lastName: personsTable.lastName,
      dob: personsTable.dob,
      waitlistType: waitlistItemsTable.waitlistType,
      contactStatus: waitlistItemsTable.contactStatus,
      planningStatus: waitlistItemsTable.planningStatus,
      registeredOn: waitlistItemsTable.createdAt,
      intakeBy: waitlistItemsTable.intakeBy,
      practicalInfo: waitlistItemsTable.practicalInfo,
    })
    .from(waitlistItemsTable)
    .innerJoin(registrationsTable, onRegistration)
    .innerJoin(personsTable, onPatient)
    .where(where)
    .orderBy(...waitlistSort.toOrderBy(sort.sort, sort.dir))
    .limit(PAGE_SIZE)
    .offset(toOffset(page, PAGE_SIZE));

  return { rows, total, page, pageCount, sort };
}

const countInView = (view: WaitlistView) =>
  sql<number>`count(*) filter (where ${waitlistViewCondition(view)})`.mapWith(
    Number,
  );

export async function countWaitlistItemsByView(
  params: WaitlistParams,
): Promise<Record<WaitlistView, number>> {
  const [counts] = await db
    .select({ active: countInView("active"), handled: countInView("handled") })
    .from(waitlistItemsTable)
    .innerJoin(registrationsTable, onRegistration)
    .innerJoin(personsTable, onPatient)
    .where(buildWhere(waitlistConditions, { ...params, planningStatus: null }));

  return counts;
}

export const findWaitlistItemById = cache(
  async (waitlistItemId: string): Promise<WaitlistItemDetail | undefined> => {
    const found = await db.query.waitlistItemsTable.findFirst({
      where: { id: waitlistItemId },
      with: { registration: { with: { patient: true, guardians: true } } },
    });

    if (!found?.registration) return undefined;

    const { registration, ...waitlistItem } = found;
    const { patient, guardians, ...registrationFields } = registration;

    if (!patient) return undefined;

    const otherEntries = await db
      .select({
        id: waitlistItemsTable.id,
        waitlistType: waitlistItemsTable.waitlistType,
        planningStatus: waitlistItemsTable.planningStatus,
      })
      .from(waitlistItemsTable)
      .where(
        and(
          eq(waitlistItemsTable.patientId, waitlistItem.patientId),
          ne(waitlistItemsTable.id, waitlistItem.id),
        ),
      )
      .orderBy(asc(waitlistItemsTable.createdAt));

    return {
      waitlistItem,
      registration: registrationFields,
      patient,
      guardians,
      otherEntries,
    };
  },
);
