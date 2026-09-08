"use client";

import ListFilters from "@/components/organisms/list/list-filters";
import {
  waitlistFilterControls,
  waitlistListParsers,
} from "@/lib/lists/waitlist-items/search-params";
import { useQueryStates } from "nuqs";

const toInputValue = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  return typeof value === "string" ? value : "";
};

export default function WaitlistFilters() {
  const [params, setParams] = useQueryStates(waitlistListParsers);

  const values = Object.fromEntries(
    waitlistFilterControls.map((control) => [
      control.key,
      toInputValue(params[control.key]),
    ]),
  );

  const handleChange = (key: string, value: string | null) => {
    const control = waitlistFilterControls.find((it) => it.key === key);
    if (!control) return;

    setParams({
      [control.key]: control.kind === "date" && value ? new Date(value) : value,
      page: null,
    });
  };

  return (
    <ListFilters
      controls={waitlistFilterControls}
      values={values}
      onChangeAction={handleChange}
    />
  );
}
