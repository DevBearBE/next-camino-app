import { contactStatusLabels } from "@/lib/i18n/contact-status-labels";
import { planningStatusLabels } from "@/lib/i18n/planning-status-labels";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { ColumnDef } from "@/lib/lists/types";
import type { WaitlistSortKey } from "@/lib/lists/waitlist-items/search-params";
import type { WaitlistRow } from "@/lib/types/waitlist-items";
import {
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
    key: "supportNeed",
    header: "Aanmeldingsreden",
    className: "text-sm text-primary-600",
    cell: (row) => (
      <span className="block max-w-64 truncate" title={row.supportNeed}>
        {row.supportNeed}
      </span>
    ),
  },
  {
    key: "contactStatus",
    header: "Contactstatus",
    sortKey: "contactStatus",
    className: "text-sm",
    cell: (row) => contactStatusLabels[row.contactStatus],
  },
  {
    key: "planningStatus",
    header: "Planningsstatus",
    sortKey: "planningStatus",
    className: "text-sm",
    cell: (row) => planningStatusLabels[row.planningStatus],
  },
  {
    key: "registeredOn",
    header: "Aangemeld op",
    sortKey: "createdAt",
    className: numeric,
    cell: (row) => formatDate(row.registeredOn),
  },
  {
    key: "intakeAt",
    header: "Intake",
    sortKey: "intakeAt",
    className: numeric,
    cell: (row) => formatDate(row.intakeAt),
  },
];
