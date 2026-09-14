import Pagination from "@/components/modules/pagination/pagination";
import DataTable from "@/components/organisms/list/data-table";
import { waitlistColumns } from "@/components/organisms/list/waitlist-items/columns";
import WaitlistEmpty from "@/components/organisms/list/waitlist-items/waitlist-empty";
import { findWaitlistItems } from "@/lib/db/queries/waitlist-items/select";
import type { SortPatch } from "@/lib/types/lists";
import {
  serializeWaitlistParams,
  type WaitlistParams,
  type WaitlistSortKey,
} from "@/lib/lists/waitlist-items/search-params";

type WaitlistPatch =
  SortPatch<WaitlistSortKey> | { readonly page: number | null };

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

  return (
    <>
      <DataTable
        columns={waitlistColumns}
        rows={rows}
        sort={sort}
        rowKey={(row) => row.id}
        buildHref={buildHref}
        caption="Aanmeldingen op de wachtlijst"
        empty={<WaitlistEmpty filtered={filtered} />}
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
