"use client";

import { waitlistListParsers } from "@/lib/lists/waitlist-items/search-params";
import { cn } from "@/lib/utils/functions/styling";
import { debounce, useQueryStates } from "nuqs";

const SEARCH_DEBOUNCE_MS = 300;

const searchParsers = {
  q: waitlistListParsers.q,
  page: waitlistListParsers.page,
};

export default function WaitlistSearch() {
  const [{ q }, setParams] = useQueryStates(searchParsers);

  return (
    <input
      type="search"
      value={q}
      onChange={(event) =>
        setParams(
          { q: event.target.value || null, page: null },
          { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) },
        )
      }
      placeholder="Zoek op naam.."
      aria-label="Zoek op naam"
      className={cn(
        "w-full sm:w-56 rounded-lg bg-surface-input/50 px-4 py-2 inset-ring inset-ring-primary-300",
        "placeholder:text-primary-400",
        "transition-all duration-150 ease-in-out hover:inset-ring-2 hover:inset-ring-primary-500",
        "focus:outline-none focus:bg-surface focus:inset-ring-2 focus:inset-ring-accent-500",
      )}
    />
  );
}
