import SortableHeader from "@/components/atoms/table/sortable-header";
import type { ColumnDef, SortPatch, SortState } from "@/lib/lists/types";
import { cn } from "@/lib/utils/functions/styling";
import type { ReactNode } from "react";

type DataTableProps<TRow, TSortKey extends string> = {
  readonly columns: readonly ColumnDef<TRow, TSortKey>[];
  readonly rows: readonly TRow[];
  readonly sort: SortState<TSortKey>;
  readonly rowKey: (row: TRow) => string;
  readonly buildHref: (patch: SortPatch<TSortKey>) => string;
  readonly caption: string;
  readonly empty?: ReactNode;
};

export default function DataTable<TRow, TSortKey extends string>({
  columns,
  rows,
  sort,
  rowKey,
  buildHref,
  caption,
  empty = "Geen resultaten gevonden",
}: DataTableProps<TRow, TSortKey>) {
  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <SortableHeader
              key={column.key}
              label={column.header}
              sortKey={column.sortKey}
              current={sort}
              buildHref={buildHref}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-20">
              {empty}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-primary-100 transition-colors hover:bg-accent-50/35"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-4 py-3 align-middle", column.className)}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
