import type { SelectOption } from "@/components/atoms/form/select";
import type { SQL } from "drizzle-orm";
import type { GenericParserBuilder, inferParserType } from "nuqs/server";
import type { ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyParser = GenericParserBuilder<any>;

export type ParserRecord = Readonly<Record<string, AnyParser>>;

export type SortDirection = "asc" | "desc";

export type SortState<TSortKey extends string> = {
  readonly sort: TSortKey;
  readonly dir: SortDirection;
};

export type SortPatch<TSortKey extends string> = SortState<TSortKey> & {
  readonly page: null;
};

export type ColumnDef<TRow, TSortKey extends string> = {
  readonly key: string;
  readonly header: string;
  readonly sortKey?: TSortKey;
  readonly cell: (row: TRow) => ReactNode;
  readonly className?: string;
};

export type ListResult<TRow, TSortKey extends string> = {
  readonly rows: readonly TRow[];
  readonly total: number;
  readonly page: number;
  readonly pageCount: number;
  readonly sort: SortState<TSortKey>;
};

export type FilterControl<TKey extends string> =
  | {
      readonly kind: "select";
      readonly key: TKey;
      readonly label: string;
      readonly options: readonly SelectOption[];
    }
  | { readonly kind: "date"; readonly key: TKey; readonly label: string };

export type ConditionMap<TParsers extends ParserRecord> = {
  readonly [K in keyof TParsers]: (
    value: NonNullable<inferParserType<TParsers[K]>>,
  ) => SQL;
};
