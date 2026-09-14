import TableSkeleton from "@/components/organisms/list/table-skeleton";
import { panelClasses } from "@/components/templates/basic-page-template";

const WAITLIST_COLUMN_COUNT = 7;

export default function Loading() {
  return (
    <main className={panelClasses}>
      <div className="px-6 py-4 min-h-20 shadow-header" />
      <div className="grow min-h-0 overflow-auto">
        <TableSkeleton columnCount={WAITLIST_COLUMN_COUNT} />
      </div>
    </main>
  );
}
