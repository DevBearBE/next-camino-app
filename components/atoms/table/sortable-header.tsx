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
  "px-4 py-3 text-left text-sm font-extrabold tracking-wide text-ink-500 whitespace-nowrap";

export default function SortableHeader<TSortKey extends string>({
  label,
  sortKey,
  current,
  buildHref,
  className,
}: SortableHeaderProps<TSortKey>) {
  if (!sortKey) {
    return (
      <th scope="col" className={cn(cellClasses, className)}>
        {label}
      </th>
    );
  }

  const isActive = current.sort === sortKey;
  const ascending = isActive && current.dir === "asc";

  return (
    <th
      scope="col"
      className={cn(cellClasses, className)}
      aria-sort={
        isActive ? (ascending ? "ascending" : "descending") : undefined
      }
    >
      <Link
        href={buildHref(toggleSort(current, sortKey))}
        className={cn(
          "group inline-flex items-center gap-x-1 rounded transition-colors",
          "hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
          isActive && "text-primary-800",
        )}
      >
        {label}
        <LucideIcon
          name={ascending ? "chevronUp" : "chevronDown"}
          size="xxs"
          className={cn(!isActive && "opacity-0 group-hover:opacity-40")}
        />
      </Link>
    </th>
  );
}
