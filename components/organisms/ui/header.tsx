import { ReactNode } from "react";

type HeaderProps = {
  readonly search?: ReactNode;
  readonly filterButton?: ReactNode;
  readonly actionButton?: ReactNode;
};

export default function Header({
  search,
  filterButton,
  actionButton,
}: HeaderProps) {
  return (
    <article className="px-6 py-4 min-h-20 flex items-center justify-between shadow-[0_4px_6px_-4px_rgba(0,0,0,0.15)]">
      <section>breadcrumbs</section>
      <section className="flex items-center gap-3">
        {search && <section>{search}</section>}
        {filterButton && <section>{filterButton}</section>}
        {actionButton && <section>{actionButton}</section>}
      </section>
    </article>
  );
}
