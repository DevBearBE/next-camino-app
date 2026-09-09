import DateInput from "@/components/atoms/form/date-input";
import Select from "@/components/atoms/form/select";
import type { FilterControl } from "@/lib/lists/types";

type ListFiltersProps<TKey extends string> = {
  readonly controls: readonly FilterControl<TKey>[];
  readonly values: Readonly<Record<string, string>>;
  readonly onChange: (key: TKey, value: string | null) => void;
  readonly clearLabel?: string;
};

export default function ListFilters<TKey extends string>({
  controls,
  values,
  onChange,
  clearLabel = "Alle",
}: ListFiltersProps<TKey>) {
  return (
    <section
      aria-label="Filters"
      className="grid grid-cols-1 gap-6 bg-primary-100 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {controls.map((control) =>
        control.kind === "select" ? (
          <Select
            key={control.key}
            name={control.key}
            label={control.label}
            placeholder={clearLabel}
            options={[{ value: "", label: clearLabel }, ...control.options]}
            value={values[control.key] ?? ""}
            onValueChange={(next) => onChange(control.key, next ? next : null)}
          />
        ) : (
          <DateInput
            key={control.key}
            name={control.key}
            label={control.label}
            value={values[control.key] ?? ""}
            onValueChange={(next) => onChange(control.key, next || null)}
          />
        ),
      )}
    </section>
  );
}
