import { Breadcrumb } from "@/lib/types/ui/breadcrumb";
import { ReactNode } from "react";

type HeaderProps = {
  readonly breadcrumbs: ReadonlyArray<Breadcrumb>;
  readonly showSearch?: boolean;
  readonly onSearchSubmit?: (search: string) => void;
  readonly searchValue?: string;
  readonly filterButton?: ReactNode;
  readonly actionButton?: ReactNode;
};

export default function Header({
  breadcrumbs,
  showSearch,
  onSearchSubmit,
  searchValue,
  filterButton,
  actionButton,
}: HeaderProps) {
  return (
    <article className="px-6 py-4 min-h-20 flex items-center justify-between shadow-[0_4px_6px_-4px_rgba(0,0,0,0.15)]">
      <section>breadcrumbs</section>
      <section className="flex items-center gap-3">
        {showSearch && (
          <input
            type="text"
            placeholder="zoeken.."
            // value={searchValue}
            // onChange={(e) => onSearchSubmit?.(e.target.value)}
          />
        )}
        {filterButton && <section>{filterButton}</section>}
        {actionButton && <section>{actionButton}</section>}
      </section>
    </article>
  );
}
