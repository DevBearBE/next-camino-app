"use client";

import BasicPageTemplate from "@/components/templates/basic-page-template";
import { useState } from "react";
import ToggleFiltersButton from "@/components/atoms/buttons/toggle-filters-button";
import NewRegistrationButton from "@/components/atoms/buttons/new-registration-button";

export default function WaitlistPage() {
  const [showFilters, setShowFilters] = useState(false);
  // TODO add a way to manage active filters and add filterCount to the toggle filters button

  return (
    <BasicPageTemplate
      showSearch
      filterButton={
        <ToggleFiltersButton
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterCount={0}
        />
      }
      actionButton={<NewRegistrationButton />}
    >
      {showFilters && (
        <p className="bg-primary-150 px-6 py-2">Filters zijn open</p>
      )}
      <section className="grow flex flex-col">
        <h1>Camino Wachtlijst</h1>
      </section>
    </BasicPageTemplate>
  );
}
