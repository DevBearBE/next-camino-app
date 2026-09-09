import { db } from "@/lib/db/drizzle";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";
import { buildWhere, defineSort } from "@/lib/lists/filters";
import {
  PAGE_SIZE,
  clampPage,
  toOffset,
  toPageCount,
} from "@/lib/lists/pagination";
import type { ListResult } from "@/lib/lists/types";
import {
  waitlistConditions,
  waitlistSortColumns,
  waitlistSortTiebreaker,
} from "@/lib/lists/waitlist-items/conditions";
import type {
  WaitlistParams,
  WaitlistSortKey,
} from "@/lib/lists/waitlist-items/search-params";
import { type Person, type SavablePerson } from "@/lib/types/persons";
import {
  type CreateWaitlistItem,
  type WaitlistItem,
  type WaitlistRow,
} from "@/lib/types/waitlist-items";
import { count, eq, or } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findExistingGuardian(
  tx: Transaction,
  guardianData: Pick<SavablePerson, "tel" | "email">,
): Promise<Person | undefined> {
  if (!guardianData.tel && !guardianData.email) return undefined;

  const [existing] = await tx
    .select()
    .from(personsTable)
    .where(
      or(
        guardianData.tel ? eq(personsTable.tel, guardianData.tel) : undefined,
        guardianData.email
          ? eq(personsTable.email, guardianData.email)
          : undefined,
      ),
    )
    .limit(1);

  return existing;
}

async function findOrCreateGuardian(
  tx: Transaction,
  guardianData: SavablePerson,
): Promise<Person> {
  const existing = await findExistingGuardian(tx, guardianData);

  if (existing) return existing;

  const [created] = await tx
    .insert(personsTable)
    .values(guardianData)
    .returning();

  return created;
}

async function linkGuardianToRegistration(
  tx: Transaction,
  registrationId: string,
  guardianData: SavablePerson,
): Promise<Person> {
  const guardian = await findOrCreateGuardian(tx, guardianData);

  await tx
    .insert(registrationGuardiansTable)
    .values({ registrationId, guardianId: guardian.id });

  return guardian;
}

export async function createWaitlistItem(
  input: CreateWaitlistItem,
  createdBy: string,
): Promise<WaitlistItem> {
  return db.transaction(async (tx) => {
    const [patient] = await tx
      .insert(personsTable)
      .values(input.patient)
      .returning();

    const [registration] = await tx
      .insert(registrationsTable)
      .values({
        ...input.registration,
        patientId: patient.id,
        createdBy,
      })
      .returning();

    for (const guardianData of input.guardians) {
      await linkGuardianToRegistration(tx, registration.id, guardianData);
    }

    const [waitlistItem] = await tx
      .insert(waitlistItemsTable)
      .values({
        ...input.waitlistItem,
        registrationId: registration.id,
        createdBy,
      })
      .returning();

    return waitlistItem;
  });
}

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
