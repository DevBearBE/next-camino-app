"use client";

import { Field } from "@base-ui/react";
import { useEffect, useRef, useState } from "react";
import InputShell from "@/components/atoms/form/input-shell";
import ChildSummary from "@/components/modules/form/child-summary";
import { searchChildrenAction } from "@/lib/actions/waitlist-items";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { ChildSearchResult } from "@/lib/types/children";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

type ChildSearchProps = {
  readonly onSelectAction: (child: ChildSearchResult) => void;
};

type SearchState =
  | {
      readonly query: string;
      readonly status: "done";
      readonly results: readonly ChildSearchResult[];
    }
  | { readonly query: string; readonly status: "error" };

export default function ChildSearch({ onSelectAction }: ChildSearchProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<SearchState | null>(null);
  const query = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS);
  const latestRequest = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequest.current;

    if (query.length < MIN_QUERY_LENGTH) return;

    searchChildrenAction({ query })
      .then((result) => {
        if (requestId !== latestRequest.current) return;

        setState(
          result?.data
            ? { query, status: "done", results: result.data }
            : { query, status: "error" },
        );
      })
      .catch(() => {
        if (requestId === latestRequest.current) {
          setState({ query, status: "error" });
        }
      });
  }, [query]);

  const current = state?.query === text.trim() ? state : null;
  const isSearching = text.trim().length >= MIN_QUERY_LENGTH && !current;

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
        {current?.status === "done"
          ? `${current.results.length} ${current.results.length === 1 ? "resultaat" : "resultaten"}`
          : ""}
      </p>
      {isSearching && (
        <p className="text-sm text-ink-500" role="status">
          Zoeken...
        </p>
      )}
      {current?.status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          Zoeken lukt niet, pas de zoekterm aan en probeer opnieuw
        </p>
      )}
      {current?.status === "done" && current.results.length === 0 && (
        <p className="text-sm text-ink-500">Geen kinderen gevonden</p>
      )}
      {current?.status === "done" && current.results.length > 0 && (
        <ul className="flex flex-col gap-y-2">
          {current.results.map((child) => (
            <li key={child.patientId}>
              <button
                type="button"
                onClick={() => onSelectAction(child)}
                className="w-full cursor-pointer rounded-lg bg-primary-50 px-4 py-3 text-left shadow-soft transition-colors hover:bg-accent-50/50"
              >
                <ChildSummary child={child} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
