import TableSkeleton from "@/components/organisms/list/table-skeleton";

const WAITLIST_COLUMN_COUNT = 8;

export default function Loading() {
  return (
    <main className="grow mt-4 flex flex-col bg-white rounded-tl-2xl">
      <div className="px-6 py-4 min-h-20 shadow-header" />
      <TableSkeleton columnCount={WAITLIST_COLUMN_COUNT} />
    </main>
  );
}
