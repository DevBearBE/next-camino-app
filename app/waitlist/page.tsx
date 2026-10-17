import TableSkeleton from "@/components/organisms/list/table-skeleton";
import { waitlistColumns } from "@/components/organisms/list/waitlist-items/columns";
import WaitlistTabs from "@/components/organisms/list/waitlist-items/waitlist-tabs";
import WaitlistTable from "@/components/organisms/list/waitlist-items/waitlist-table";
import WaitlistPage from "@/components/pages/waitlist-page";
import {
  loadWaitlistParams,
  serializeWaitlistParams,
  waitlistFilterControls,
} from "@/lib/lists/waitlist-items/search-params";
import { isStatusInView } from "@/lib/db/enums";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
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

  if (
    params.planningStatus &&
    !isStatusInView(params.planningStatus, params.view)
  ) {
    redirect(
      `/waitlist${serializeWaitlistParams({ ...params, planningStatus: null, page: null })}`,
    );
  }

  const filterCount = waitlistFilterControls.filter((control) => {
    const value = params[control.key];
    return value !== null && value !== "";
  }).length;

  return (
    <WaitlistPage
      filterCount={filterCount}
      tabs={
        <Suspense
          fallback={<div className="h-[46px] border-b border-primary-100" />}
        >
          <WaitlistTabs params={params} />
        </Suspense>
      }
    >
      <Suspense
        key={serializeWaitlistParams({ ...params, q: null })}
        fallback={<TableSkeleton columnCount={waitlistColumns.length} />}
      >
        <WaitlistTable
          params={params}
          filtered={filterCount > 0 || params.q !== ""}
        />
      </Suspense>
    </WaitlistPage>
  );
}
