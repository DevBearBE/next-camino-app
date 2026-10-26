import Link from "next/link";
import { countWaitlistItemsByView } from "@/lib/db/queries/waitlist-items/select";
import {
  serializeWaitlistParams,
  type WaitlistParams,
  type WaitlistView,
  waitlistViews,
} from "@/lib/lists/waitlist-items/search-params";
import { cn } from "@/lib/utils/functions/styling";

const viewLabels: Record<WaitlistView, string> = {
  active: "Actief",
  handled: "Afgehandeld",
};

export default async function WaitlistTabs({
  params,
}: {
  readonly params: WaitlistParams;
}) {
  const counts = await countWaitlistItemsByView(params);

  return (
    <nav
      aria-label="Weergave"
      className="flex gap-x-6 border-b border-primary-100 px-6"
    >
      {waitlistViews.map((view) => {
        const isCurrent = view === params.view;

        return (
          <Link
            key={view}
            href={`/waitlist${serializeWaitlistParams({
              ...params,
              view,
              page: null,
              sort: null,
              dir: null,
              planningStatus: null,
            })}`}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-x-2 border-b-2 py-3 text-sm font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
              isCurrent
                ? "border-accent-500 text-primary-800"
                : "border-transparent text-ink-500 hover:text-primary-800",
            )}
          >
            {viewLabels[view]}
            <span
              className={cn(
                "rounded-full px-2 text-xs tabular-nums",
                isCurrent
                  ? "bg-accent-100 text-accent-800"
                  : "bg-primary-100 text-ink-500",
              )}
            >
              {counts[view]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
