import SortableHeader from "@/components/atoms/table/sortable-header";
import type { ColumnDef, SortPatch, SortState } from "@/lib/types/lists";
import { cn } from "@/lib/utils/functions/styling";
import Link from "next/link";
import type { ReactNode } from "react";

type DataTableProps<TRow, TSortKey extends string> = {
  readonly columns: readonly ColumnDef<TRow, TSortKey>[];
  readonly rows: readonly TRow[];
  readonly sort: SortState<TSortKey>;
  readonly rowKey: (row: TRow) => string;
  readonly buildHref: (patch: SortPatch<TSortKey>) => string;
  readonly rowHref?: (row: TRow) => string;
  readonly caption: string;
  readonly empty?: ReactNode;
};

export default function DataTable<TRow, TSortKey extends string>({
  columns,
  rows,
  sort,
  rowKey,
  buildHref,
  rowHref,
  caption,
  empty = "Geen resultaten gevonden",
}: DataTableProps<TRow, TSortKey>) {
  return (
    <table className="w-full border-separate border-spacing-0">
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
              className={cn(
                "transition-colors hover:bg-accent-50/50",
                rowHref && "relative",
              )}
            >
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  className={cn(
                    "border-b border-primary-100 px-4 py-3 align-middle",
                    column.className,
                  )}
                >
                  {rowHref && index === 0 ? (
                    <Link
                      href={rowHref(row)}
                      className={cn(
                        "text-inherit no-underline",
                        "after:absolute after:inset-0",
                        "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent-500",
                      )}
                    >
                      {column.cell(row)}
                    </Link>
                  ) : (
                    column.cell(row)
                  )}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
