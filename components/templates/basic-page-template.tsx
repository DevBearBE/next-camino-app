import { cn } from "@/lib/utils/functions/styling";
import { HTMLProps, ReactNode } from "react";
import Header from "@/components/organisms/ui/header";

type BasicPageTemplateProps = HTMLProps<HTMLElement> & {
  readonly title: string;
  readonly search?: ReactNode;
  readonly filterButton?: ReactNode;
  readonly actionButton?: ReactNode;
};

export default function BasicPageTemplate({
  children,
  className,
  title,
  search,
  filterButton,
  actionButton,
  ...props
}: BasicPageTemplateProps) {
  return (
    <main
      className={cn(
        "grow mt-4 flex min-w-0 flex-col bg-white rounded-tl-2xl",
        className,
      )}
      {...props}
    >
      <Header
        title={title}
        search={search}
        filterButton={filterButton}
        actionButton={actionButton}
      />
      {children}
    </main>
  );
}
