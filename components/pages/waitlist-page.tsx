"use client";

import NewRegistrationButton from "@/components/atoms/buttons/new-registration-button";
import ToggleFiltersButton from "@/components/atoms/buttons/toggle-filters-button";
import WaitlistFilters from "@/components/organisms/list/waitlist-items/waitlist-filters";
import WaitlistSearch from "@/components/organisms/list/waitlist-items/waitlist-search";
import BasicPageTemplate from "@/components/templates/basic-page-template";
import { PropsWithChildren, useState } from "react";

type WaitlistPageProps = PropsWithChildren<{
  readonly filterCount: number;
}>;

export default function WaitlistPage({
  filterCount,
  children,
}: WaitlistPageProps) {
  const [showFilters, setShowFilters] = useState(filterCount > 0);

  return (
    <BasicPageTemplate
      title="Wachtlijst"
      search={<WaitlistSearch />}
      filterButton={
        <ToggleFiltersButton
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterCount={filterCount}
        />
      }
      actionButton={<NewRegistrationButton />}
    >
      {showFilters && <WaitlistFilters />}
      <section className="grow flex min-w-0 flex-col">{children}</section>
    </BasicPageTemplate>
  );
}
