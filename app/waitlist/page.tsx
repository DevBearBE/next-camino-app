import TableSkeleton from "@/components/organisms/list/table-skeleton";
import { waitlistColumns } from "@/components/organisms/list/waitlist-items/columns";
import WaitlistTable from "@/components/organisms/list/waitlist-items/waitlist-table";
import WaitlistPage from "@/components/pages/waitlist-page";
import {
  loadWaitlistParams,
  serializeWaitlistParams,
  waitlistFilterControls,
} from "@/lib/lists/waitlist-items/search-params";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Wachtlijst",
};

export default async function Waitlist({
  searchParams,
}: PageProps<"/waitlist">) {
  const { userId } = await auth();
  if (!userId) return null;

  const params = loadWaitlistParams(await searchParams);

  const filterCount = waitlistFilterControls.filter((control) => {
    const value = params[control.key];
    return value !== null && value !== "";
  }).length;

  return (
    <WaitlistPage filterCount={filterCount}>
      <Suspense
        key={serializeWaitlistParams(params)}
        fallback={<TableSkeleton columnCount={waitlistColumns.length} />}
      >
        <WaitlistTable params={params} />
      </Suspense>
    </WaitlistPage>
  );
}
