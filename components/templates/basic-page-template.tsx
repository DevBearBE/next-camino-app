import { cn } from "@/lib/utils/functions/styling";
import { HTMLProps, ReactNode } from "react";
import Header from "@/components/organisms/ui/header";

type BasicPageTemplateProps = HTMLProps<HTMLElement> & {
  readonly showSearch?: boolean;
  readonly filterButton?: ReactNode;
  readonly actionButton?: ReactNode;
};

export default function BasicPageTemplate({
  children,
  className,
  showSearch = false,
  filterButton,
  actionButton,
  ...props
}: BasicPageTemplateProps) {
  return (
    <main
      className={cn(
        "grow mt-4 flex flex-col bg-white rounded-tl-2xl",
        className,
      )}
      {...props}
    >
      <Header
        breadcrumbs={[]}
        showSearch={showSearch}
        filterButton={filterButton}
        actionButton={actionButton}
      />
      {children}
    </main>
  );
}
