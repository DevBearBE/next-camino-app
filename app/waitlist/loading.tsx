import TableSkeleton from "@/components/organisms/list/table-skeleton";
import { waitlistColumns } from "@/components/organisms/list/waitlist-items/columns";
import { panelClasses } from "@/components/templates/basic-page-template";

export default function Loading() {
  return (
    <main className={panelClasses}>
      <div className="px-6 py-4 min-h-20 shadow-header" />
      <div className="grow min-h-0 overflow-auto">
        <TableSkeleton columnCount={waitlistColumns.length} />
      </div>
    </main>
  );
}
