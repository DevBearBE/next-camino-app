import LucideIcon from "@/components/atoms/icons/lucide-icon";
import Heading from "@/components/atoms/typography/heading";
import Link from "next/link";

export default function WaitlistEmpty({
  filtered,
}: {
  readonly filtered: boolean;
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
          : "Nog geen aanmeldingen"}
      </Heading>

      <span className="max-w-sm text-sm text-ink-500">
        {filtered
          ? "Pas de filters aan of wis ze om alle aanmeldingen te zien."
          : "Nieuwe aanmeldingen verschijnen hier zodra ze zijn toegevoegd."}
      </span>

      {filtered && (
        <Link
          href="/waitlist"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent-600 hover:bg-accent-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Filters wissen
        </Link>
      )}
    </span>
  );
}
