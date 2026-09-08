import SortableHeader from "@/components/atoms/table/sortable-header";
import type { ColumnDef, SortPatch, SortState } from "@/lib/lists/types";
import { cn } from "@/lib/utils/functions/styling";

type DataTableProps<TRow, TSortKey extends string> = {
  readonly columns: readonly ColumnDef<TRow, TSortKey>[];
  readonly rows: readonly TRow[];
  readonly sort: SortState<TSortKey>;
  readonly rowKey: (row: TRow) => string;
  readonly buildHref: (patch: SortPatch<TSortKey>) => string;
  readonly emptyLabel?: string;
};

export default function DataTable<TRow, TSortKey extends string>({
  columns,
  rows,
  sort,
  rowKey,
  buildHref,
  emptyLabel = "Geen resultaten gevonden",
}: DataTableProps<TRow, TSortKey>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-primary-200">
            {columns.map((column) => (
              <SortableHeader
                key={column.key}
                label={column.header}
                sortKey={column.sortKey}
                current={sort}
                buildHref={buildHref}
                className={column.className}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-primary-400"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-primary-100 transition-colors hover:bg-primary-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 align-top", column.className)}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
