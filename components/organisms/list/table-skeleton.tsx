import { cn } from "@/lib/utils/functions/styling";

type TableSkeletonProps = {
  readonly columnCount: number;
  readonly rowCount?: number;
};

const widths = ["w-32", "w-20", "w-40", "w-24", "w-28", "w-36"];

export default function TableSkeleton({
  columnCount,
  rowCount = 8,
}: TableSkeletonProps) {
  const columns = Array.from({ length: columnCount }, (_, index) => index);
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <div className="overflow-x-auto" aria-busy="true" aria-live="polite">
      <span className="sr-only">Aanmeldingen laden</span>
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-b border-primary-100">
              {columns.map((column) => (
                <td key={column} className="px-4 py-4">
                  <span
                    className={cn(
                      "block h-3 rounded bg-primary-150 motion-safe:animate-pulse",
                      widths[(row + column) % widths.length],
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
