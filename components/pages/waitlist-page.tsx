"use client";

import { type PropsWithChildren, type ReactNode, useState } from "react";
import NewRegistrationButton from "@/components/atoms/buttons/new-registration-button";
import ToggleFiltersButton from "@/components/atoms/buttons/toggle-filters-button";
import WaitlistFilters from "@/components/organisms/list/waitlist-items/waitlist-filters";
import WaitlistSearch from "@/components/organisms/list/waitlist-items/waitlist-search";
import BasicPageTemplate from "@/components/templates/basic-page-template";

type WaitlistPageProps = PropsWithChildren<{
  readonly filterCount: number;
  readonly tabs: ReactNode;
}>;

export default function WaitlistPage({
  filterCount,
  tabs,
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
      beforeContent={
        <>
          {tabs}
          {showFilters && <WaitlistFilters />}
        </>
      }
    >
      {children}
    </BasicPageTemplate>
  );
}
