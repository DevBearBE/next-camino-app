import Heading from "@/components/atoms/typography/heading";
import { ReactNode } from "react";

type HeaderProps = {
  readonly title: string;
  readonly search?: ReactNode;
  readonly filterButton?: ReactNode;
  readonly actionButton?: ReactNode;
};

export default function Header({
  title,
  search,
  filterButton,
  actionButton,
}: HeaderProps) {
  return (
    <article className="px-6 py-4 min-h-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 shadow-header">
      <Heading size="xl">{title}</Heading>
      <section className="flex flex-wrap items-center gap-3">
        {search && <section className="min-w-0">{search}</section>}
        {filterButton && <section>{filterButton}</section>}
        {actionButton && <section>{actionButton}</section>}
      </section>
    </article>
  );
}
