import TableSkeleton from "@/components/organisms/list/table-skeleton";
import { waitlistColumns } from "@/components/organisms/list/waitlist-items/columns";

export default function Loading() {
  return (
    <main className="grow mt-4 flex flex-col bg-white rounded-tl-2xl">
      <div className="px-6 py-4 min-h-20 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.15)]" />
      <TableSkeleton columnCount={waitlistColumns.length} />
    </main>
  );
}
