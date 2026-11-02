import Link from "next/link";

export type OtherWaitlistsStripEntry = {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly href: string;
};

type OtherWaitlistsStripProps = {
  readonly entries: readonly OtherWaitlistsStripEntry[];
};

export default function OtherWaitlistsStrip({
  entries,
}: OtherWaitlistsStripProps) {
  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Andere wachtlijsten"
      className="mx-8 mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-accent-100 px-4 py-3 text-sm"
    >
      <span className="text-accent-500">Ook op de wachtlijst van:</span>
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={entry.href}
          className="font-bold text-accent-600"
        >
          {entry.label} ({entry.status})
        </Link>
      ))}
    </nav>
  );
}
