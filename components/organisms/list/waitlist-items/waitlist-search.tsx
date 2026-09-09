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
        "w-56 rounded-lg bg-primary-100 px-4 py-2 inset-ring inset-ring-primary-100",
        "placeholder:text-primary-400",
        "transition-all duration-150 ease-in-out hover:inset-ring-primary-400",
        "focus:bg-transparent focus:inset-ring-primary-400/40 focus:outline-none",
      )}
    />
  );
}
