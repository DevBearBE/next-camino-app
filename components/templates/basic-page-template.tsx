import Header from "@/components/organisms/ui/header";
import { cn } from "@/lib/utils/functions/styling";
import { HTMLProps, ReactNode } from "react";

type BasicPageTemplateProps = HTMLProps<HTMLElement> & {
  readonly title: string;
  readonly search?: ReactNode;
  readonly filterButton?: ReactNode;
  readonly actionButton?: ReactNode;
  readonly beforeContent?: ReactNode;
  readonly contentClassName?: string;
};

export const panelClasses =
  "grow mt-4 flex min-h-0 min-w-0 flex-col overflow-hidden bg-white rounded-tl-2xl";

export default function BasicPageTemplate({
  children,
  className,
  contentClassName,
  title,
  search,
  filterButton,
  actionButton,
  beforeContent,
  ...props
}: BasicPageTemplateProps) {
  return (
    <main className={cn(panelClasses, className)} {...props}>
      <div className="shrink-0">
        <Header
          title={title}
          search={search}
          filterButton={filterButton}
          actionButton={actionButton}
        />
        {beforeContent}
      </div>

      <div className={cn("grow min-h-0 overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </main>
  );
}
