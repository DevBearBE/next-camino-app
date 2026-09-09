import LucideIcon from "@/components/atoms/icons/lucide-icon";
import { toggleSort } from "@/lib/lists/filters";
import type { SortPatch, SortState } from "@/lib/lists/types";
import { cn } from "@/lib/utils/functions/styling";
import Link from "next/link";

type SortableHeaderProps<TSortKey extends string> = {
  readonly label: string;
  readonly sortKey?: TSortKey;
  readonly current: SortState<TSortKey>;
  readonly buildHref: (patch: SortPatch<TSortKey>) => string;
  readonly className?: string;
};

const cellClasses =
  "sticky -top-px z-10 bg-white shadow-header text-left text-xs font-semibold uppercase tracking-wider text-ink-500 whitespace-nowrap";

export default function SortableHeader<TSortKey extends string>({
  label,
  sortKey,
  current,
  buildHref,
  className,
}: SortableHeaderProps<TSortKey>) {
  if (!sortKey) {
    return (
      <th
        scope="col"
        className={cn(
          cellClasses,
          "px-4 pt-[calc(0.75rem+1px)] pb-3",
          className,
        )}
      >
        {label}
      </th>
    );
  }

  const isActive = current.sort === sortKey;
  const ascending = isActive && current.dir === "asc";

  return (
    <th
      scope="col"
      className={cn(cellClasses, isActive && "bg-primary-100", className)}
      aria-sort={
        isActive ? (ascending ? "ascending" : "descending") : undefined
      }
    >
      <Link
        href={buildHref(toggleSort(current, sortKey))}
        className={cn(
          "flex items-center gap-x-1.5 px-4 pt-[calc(0.75rem+1px)] pb-3 transition-colors",
          "hover:text-primary-800",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500",
          isActive && "text-primary-800",
        )}
      >
        {label}
        <LucideIcon
          name={
            isActive
              ? ascending
                ? "chevronUp"
                : "chevronDown"
              : "chevronsUpDown"
          }
          size="xxs"
          className={isActive ? "text-primary-800" : "text-ink-400"}
        />
      </Link>
    </th>
  );
}
