import Pagination from "@/components/modules/pagination/pagination";
import DataTable from "@/components/organisms/list/data-table";
import {
  waitlistColumns,
  waitlistDeleteColumn,
} from "@/components/organisms/list/waitlist-items/columns";
import WaitlistEmpty from "@/components/organisms/list/waitlist-items/waitlist-empty";
import { findWaitlistItems } from "@/lib/db/queries/waitlist-items/select";
import {
  serializeWaitlistParams,
  type WaitlistParams,
  type WaitlistSortKey,
} from "@/lib/lists/waitlist-items/search-params";
import type { SortPatch } from "@/lib/types/lists";
import type { WaitlistRow } from "@/lib/types/waitlist-items";
import { formatFullName, slugify } from "@/lib/utils/functions/helpers";

type WaitlistPatch =
  | SortPatch<WaitlistSortKey>
  | { readonly page: number | null };

export default async function WaitlistTable({
  params,
  filtered,
}: {
  readonly params: WaitlistParams;
  readonly filtered: boolean;
}) {
  const { rows, total, page, pageCount, sort } =
    await findWaitlistItems(params);

  const buildHref = (patch: WaitlistPatch): string =>
    `/waitlist${serializeWaitlistParams({ ...params, ...patch })}`;

  const rowHref = (row: WaitlistRow): string =>
    `/waitlist/${row.patientId}/${slugify(formatFullName(row))}${serializeWaitlistParams(params)}`;

  return (
    <>
      <DataTable
        columns={
          params.view === "handled"
            ? [...waitlistColumns, waitlistDeleteColumn]
            : waitlistColumns
        }
        rows={rows}
        sort={sort}
        rowKey={(row) => row.id}
        buildHref={buildHref}
        rowHref={rowHref}
        caption="Aanmeldingen op de wachtlijst"
        empty={<WaitlistEmpty filtered={filtered} view={params.view} />}
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
