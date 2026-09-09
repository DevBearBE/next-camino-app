import Button from "@/components/atoms/buttons/button";

type ToggleFiltersButtonProps = {
  readonly showFilters: boolean;
  readonly setShowFilters: (showFilters: boolean) => void;
  readonly filterCount?: number;
};

export default function ToggleFiltersButton({
  showFilters,
  setShowFilters,
  filterCount,
}: ToggleFiltersButtonProps) {
  return (
    <Button
      variant="ghost"
      className="flex items-center gap-x-2.5"
      rightIcon={showFilters ? "chevronUp" : "chevronDown"}
      rightIconSize="xs"
      onClick={() => setShowFilters(!showFilters)}
      aria-expanded={showFilters}
    >
      <span>Filters</span>
      {(filterCount ?? 0) > 0 && (
        <span className="px-1.5 text-sm text-white bg-accent-500 rounded-full">
          {filterCount}
          <span className="sr-only"> actieve filters</span>
        </span>
      )}
    </Button>
  );
}
