import { PAGE_SIZE, toOffset, toPageWindow } from "@/lib/lists/pagination";
import { cn } from "@/lib/utils/functions/styling";
import Link from "next/link";

type PaginationProps = {
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
  readonly pageSize?: number;
  readonly buildHref: (patch: { readonly page: number | null }) => string;
};

const stepClasses =
  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

const toHref = (
  buildHref: PaginationProps["buildHref"],
  target: number,
): string => buildHref({ page: target === 1 ? null : target });

export default function Pagination({
  page,
  pageCount,
  total,
  pageSize = PAGE_SIZE,
  buildHref,
}: PaginationProps) {
  if (pageCount < 1) return null;

  const pages = toPageWindow(page, pageCount);
  const rangeStart = toOffset(page, pageSize) + 1;
  const rangeEnd = Math.min(rangeStart + pageSize - 1, total);

  return (
    <nav
      aria-label="Paginering"
      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-primary-100"
    >
      <p className="text-sm text-ink-500" role="status">
        {rangeStart}&ndash;{rangeEnd} van {total}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        {page > 1 ? (
          <Link
            href={toHref(buildHref, page - 1)}
            className={cn(stepClasses, "hover:bg-primary-100")}
            rel="prev"
          >
            Vorige
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(stepClasses, "text-ink-400")}
          >
            Vorige
          </span>
        )}

        {pages.map((target) => (
          <Link
            key={target}
            href={toHref(buildHref, target)}
            aria-current={target === page ? "page" : undefined}
            className={cn(
              stepClasses,
              "tabular-nums",
              target === page
                ? "bg-accent-600 text-white"
                : "hover:bg-primary-100",
            )}
          >
            {target}
          </Link>
        ))}

        {page < pageCount ? (
          <Link
            href={toHref(buildHref, page + 1)}
            className={cn(stepClasses, "hover:bg-primary-100")}
            rel="next"
          >
            Volgende
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(stepClasses, "text-ink-400")}
          >
            Volgende
          </span>
        )}
      </div>
    </nav>
  );
}
