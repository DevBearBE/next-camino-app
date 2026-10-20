import {
  createLoader,
  createSerializer,
  type inferParserType,
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import {
  contactStatusValues,
  planningStatusValues,
  waitlistTypeValues,
} from "@/lib/db/enums";
import type { FilterControl } from "@/lib/types/lists";
import {
  contactStatusOptions,
  planningStatusOptions,
  waitlistTypeOptions,
} from "@/lib/utils/functions/form";

const serverSynced = { shallow: false } as const;

export const waitlistSortKeys = [
  "createdAt",
  "lastName",
  "waitlistType",
  "contactStatus",
  "planningStatus",
  "intakeAt",
  "dob",
] as const;

export type WaitlistSortKey = (typeof waitlistSortKeys)[number];

export const sortDirections = ["asc", "desc"] as const;

export const waitlistViews = ["active", "handled"] as const;

export type WaitlistView = (typeof waitlistViews)[number];

export const waitlistFilterParsers = {
  type: parseAsStringLiteral(waitlistTypeValues).withOptions(serverSynced),
  contactStatus:
    parseAsStringLiteral(contactStatusValues).withOptions(serverSynced),
  planningStatus:
    parseAsStringLiteral(planningStatusValues).withOptions(serverSynced),
  q: parseAsString.withOptions(serverSynced).withDefault(""),
  dobFrom: parseAsIsoDate.withOptions(serverSynced),
  dobTo: parseAsIsoDate.withOptions(serverSynced),
};

export const waitlistListParsers = {
  ...waitlistFilterParsers,
  view: parseAsStringLiteral(waitlistViews)
    .withOptions(serverSynced)
    .withDefault("active"),
  sort: parseAsStringLiteral(waitlistSortKeys).withOptions(serverSynced),
  dir: parseAsStringLiteral(sortDirections).withOptions(serverSynced),
  page: parseAsInteger.withOptions(serverSynced).withDefault(1),
};

export type WaitlistParams = inferParserType<typeof waitlistListParsers>;
export type WaitlistFilterKey = keyof typeof waitlistFilterParsers;

export const loadWaitlistParams = createLoader(waitlistListParsers);
export const serializeWaitlistParams = createSerializer(waitlistListParsers);

export const waitlistFilterControls: readonly FilterControl<WaitlistFilterKey>[] =
  [
    {
      kind: "select",
      key: "type",
      label: "Type traject",
      options: waitlistTypeOptions,
    },
    {
      kind: "select",
      key: "contactStatus",
      label: "Contactstatus",
      options: contactStatusOptions,
    },
    {
      kind: "select",
      key: "planningStatus",
      label: "Planningsstatus",
      options: planningStatusOptions,
    },
    { kind: "date", key: "dobFrom", label: "Geboortedatum vanaf" },
    { kind: "date", key: "dobTo", label: "Geboortedatum tot" },
  ];
