import Pagination from "@/components/modules/pagination/pagination";
import DataTable from "@/components/organisms/list/data-table";
import { waitlistColumns } from "@/components/organisms/list/waitlist-items/columns";
import { findWaitlistItems } from "@/lib/db/queries/waitlist-items";
import type { SortPatch } from "@/lib/lists/types";
import {
  serializeWaitlistParams,
  type WaitlistParams,
  type WaitlistSortKey,
} from "@/lib/lists/waitlist-items/search-params";

type WaitlistPatch =
  | SortPatch<WaitlistSortKey>
  | { readonly page: number | null };

export default async function WaitlistTable({
  params,
}: {
  readonly params: WaitlistParams;
}) {
  const { rows, total, page, pageCount, sort } =
    await findWaitlistItems(params);

  const buildHref = (patch: WaitlistPatch): string =>
    `/waitlist${serializeWaitlistParams({ ...params, ...patch })}`;

  return (
    <>
      <DataTable
        columns={waitlistColumns}
        rows={rows}
        sort={sort}
        rowKey={(row) => row.id}
        buildHref={buildHref}
        emptyLabel="Geen aanmeldingen gevonden"
      />
      <Pagination
        page={page}
        pageCount={pageCount}
        total={total}
        buildHref={buildHref}
      />
    </>
  );
}
