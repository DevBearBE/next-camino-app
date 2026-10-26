import StatusBadge from "@/components/atoms/badges/status-badge";
import { contactStatusLabels } from "@/lib/i18n/contact-status-labels";
import { planningStatusLabels } from "@/lib/i18n/planning-status-labels";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { WaitlistSortKey } from "@/lib/lists/waitlist-items/search-params";
import { contactStatusTones } from "@/lib/styles/contact-status-tones";
import { planningStatusTones } from "@/lib/styles/planning-status-tones";
import type { ColumnDef } from "@/lib/types/lists";
import type { WaitlistRow } from "@/lib/types/waitlist-items";
import {
  EMPTY_VALUE,
  formatDate,
  formatFullName,
  formatIsoDate,
} from "@/lib/utils/functions/helpers";

const numeric = "text-sm tabular-nums whitespace-nowrap";

export const waitlistColumns: readonly ColumnDef<
  WaitlistRow,
  WaitlistSortKey
>[] = [
  {
    key: "waitlistType",
    header: "Type traject",
    sortKey: "waitlistType",
    className: "text-sm",
    cell: (row) => waitlistTypeLabels[row.waitlistType],
  },
  {
    key: "registeredOn",
    header: "Aangemeld op",
    sortKey: "createdAt",
    className: numeric,
    cell: (row) => formatDate(row.registeredOn),
  },
  {
    key: "name",
    header: "Naam",
    rowLink: true,
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
    key: "intakeBy",
    header: "Intake door",
    className: "text-sm",
    cell: (row) => row.intakeBy || EMPTY_VALUE,
  },
  {
    key: "practicalInfo",
    header: "Praktische info",
    className: "text-sm",
    cell: (row) => (
      <span className="block max-w-xs truncate">
        {row.practicalInfo || EMPTY_VALUE}
      </span>
    ),
  },
];
