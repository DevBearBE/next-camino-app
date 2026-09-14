import StatusBadge from "@/components/atoms/badges/status-badge";
import { contactStatusLabels } from "@/lib/i18n/contact-status-labels";
import { contactStatusTones } from "@/lib/styles/contact-status-tones";
import { planningStatusLabels } from "@/lib/i18n/planning-status-labels";
import { planningStatusTones } from "@/lib/styles/planning-status-tones";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { ColumnDef } from "@/lib/types/lists";
import type { WaitlistSortKey } from "@/lib/lists/waitlist-items/search-params";
import type { WaitlistRow } from "@/lib/types/waitlist-items";
import {
  formatDate,
  formatFullName,
  formatIsoDate,
  formatWaitingTime,
} from "@/lib/utils/functions/helpers";

const numeric = "text-sm tabular-nums whitespace-nowrap";

export const waitlistColumns: readonly ColumnDef<
  WaitlistRow,
  WaitlistSortKey
>[] = [
  {
    key: "name",
    header: "Naam",
    sortKey: "lastName",
    className: "text-sm font-semibold text-primary-800",
    cell: (row) => formatFullName(row),
  },
  {
    key: "dob",
    header: "Geboortedatum",
    sortKey: "dob",
    className: numeric,
    cell: (row) => formatIsoDate(row.dob),
  },
  {
    key: "waitlistType",
    header: "Type traject",
    sortKey: "waitlistType",
    className: "text-sm",
    cell: (row) => waitlistTypeLabels[row.waitlistType],
  },
  {
    key: "contactStatus",
    header: "Contactstatus",
    sortKey: "contactStatus",
    className: "text-sm",
    cell: (row) => (
      <StatusBadge
        tone={contactStatusTones[row.contactStatus]}
        label={contactStatusLabels[row.contactStatus]}
      />
    ),
  },
  {
    key: "planningStatus",
    header: "Planningsstatus",
    sortKey: "planningStatus",
    className: "text-sm",
    cell: (row) => (
      <StatusBadge
        tone={planningStatusTones[row.planningStatus]}
        label={planningStatusLabels[row.planningStatus]}
      />
    ),
  },
  {
    key: "registeredOn",
    header: "Wachttijd",
    sortKey: "createdAt",
    className: numeric,
    cell: (row) => (
      <span className="flex flex-col">
        <span className="font-semibold text-primary-800">
          {formatWaitingTime(row.registeredOn)}
        </span>
        <span className="text-xs text-ink-500">
          {formatDate(row.registeredOn)}
        </span>
      </span>
    ),
  },
  {
    key: "intakeAt",
    header: "Intake",
    sortKey: "intakeAt",
    className: numeric,
    cell: (row) => formatDate(row.intakeAt),
  },
];
