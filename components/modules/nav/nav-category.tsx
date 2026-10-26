import type { PropsWithChildren } from "react";
import Heading from "@/components/atoms/typography/heading";

type NavCategoryProps = {
  readonly label: string;
};

export default function NavCategory({
  label,
  children,
}: PropsWithChildren<NavCategoryProps>) {
  return (
    <section className="flex flex-col gap-1">
      <Heading className="text-primary-400" size="sm">
        {label.toUpperCase()}
      </Heading>
      <ul className="flex flex-col gap-1">{children}</ul>
    </section>
  );
}
