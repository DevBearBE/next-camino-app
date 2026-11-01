import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { ChildSearchResult } from "@/lib/types/children";
import { formatFullName, formatIsoDate } from "@/lib/utils/functions/helpers";

type ChildSummaryProps = {
  readonly child: ChildSearchResult;
};

export default function ChildSummary({ child }: ChildSummaryProps) {
  return (
    <>
      <span className="block font-semibold">{formatFullName(child)}</span>
      <span className="block text-sm text-ink-500">
        {formatIsoDate(child.dob)}
        {child.guardianNames.length > 0 &&
          `, ouder: ${child.guardianNames.join(", ")}`}
      </span>
      <span className="block text-xs text-ink-400">
        Al op:{" "}
        {child.takenTypes.map((type) => waitlistTypeLabels[type]).join(", ")}
      </span>
    </>
  );
}
