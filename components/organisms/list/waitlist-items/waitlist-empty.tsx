import Link from "next/link";
import LucideIcon from "@/components/atoms/icons/lucide-icon";
import Heading from "@/components/atoms/typography/heading";
import {
  serializeWaitlistParams,
  type WaitlistView,
} from "@/lib/lists/waitlist-items/search-params";

const unfilteredCopy: Record<
  WaitlistView,
  { readonly heading: string; readonly body: string }
> = {
  active: {
    heading: "Geen actieve aanmeldingen",
    body: "Alle aanmeldingen zijn ingepland of afgehandeld.",
  },
  handled: {
    heading: "Nog geen afgehandelde aanmeldingen",
    body: "Ingeplande aanmeldingen en aanmeldingen die niet meer nodig zijn verschijnen hier.",
  },
};

export default function WaitlistEmpty({
  filtered,
  view,
}: {
  readonly filtered: boolean;
  readonly view: WaitlistView;
}) {
  return (
    <span
      role="status"
      className="flex flex-col items-center gap-y-3 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary-100">
        <LucideIcon name="search" size="md" className="text-primary-400" />
      </span>

      <Heading tag="h2" size="lg">
        {filtered
          ? "Geen aanmeldingen voor deze filters"
          : unfilteredCopy[view].heading}
      </Heading>

      <span className="max-w-sm text-sm text-ink-500">
        {filtered
          ? "Pas de filters aan of wis ze om alle aanmeldingen te zien."
          : unfilteredCopy[view].body}
      </span>

      {filtered && (
        <Link
          href={`/waitlist${serializeWaitlistParams({ view })}`}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent-600 hover:bg-accent-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Filters wissen
        </Link>
      )}
    </span>
  );
}
