"use client";

import { Field } from "@base-ui/react";
import { useEffect, useRef, useState } from "react";
import InputShell from "@/components/atoms/form/input-shell";
import { searchChildrenAction } from "@/lib/actions/waitlist-items";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { ChildSearchResult } from "@/lib/types/children";
import { formatFullName, formatIsoDate } from "@/lib/utils/functions/helpers";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

type ChildSearchProps = {
  readonly onSelectAction: (child: ChildSearchResult) => void;
};

export default function ChildSearch({ onSelectAction }: ChildSearchProps) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<readonly ChildSearchResult[] | null>(
    null,
  );
  const query = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS);
  const latestRequest = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequest.current;

    if (query.length < MIN_QUERY_LENGTH) {
      setResults(null);
      return;
    }

    searchChildrenAction({ query })
      .then((result) => {
        if (requestId === latestRequest.current) {
          setResults(result?.data ?? []);
        }
      })
      .catch(() => {
        if (requestId === latestRequest.current) setResults([]);
      });
  }, [query]);

  return (
    <div className="flex flex-col gap-y-3">
      <InputShell name="childSearch" label="Kind zoeken">
        {(controlClasses) => (
          <Field.Control
            type="search"
            className={controlClasses}
            placeholder="Zoek op naam"
            autoComplete="off"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        )}
      </InputShell>
      <p className="sr-only" aria-live="polite">
        {results
          ? `${results.length} ${results.length === 1 ? "resultaat" : "resultaten"}`
          : ""}
      </p>
      {results?.length === 0 && (
        <p className="text-sm text-ink-500">Geen kinderen gevonden</p>
      )}
      {results && results.length > 0 && (
        <ul className="flex flex-col gap-y-2">
          {results.map((child) => (
            <li key={child.patientId}>
              <button
                type="button"
                onClick={() => onSelectAction(child)}
                className="w-full cursor-pointer rounded-lg bg-primary-50 px-4 py-3 text-left shadow-soft transition-colors hover:bg-accent-50/50"
              >
                <span className="block font-semibold">
                  {formatFullName(child)}
                </span>
                <span className="block text-sm text-ink-500">
                  {formatIsoDate(child.dob)}
                  {child.guardianNames.length > 0 &&
                    `, ouder: ${child.guardianNames.join(", ")}`}
                </span>
                <span className="block text-xs text-ink-400">
                  Al op:{" "}
                  {child.takenTypes
                    .map((type) => waitlistTypeLabels[type])
                    .join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
