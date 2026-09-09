import { and, asc, desc, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type {
  ConditionMap,
  ParserRecord,
  SortDirection,
  SortPatch,
  SortState,
} from "./types.ts";

export function buildWhere<TParsers extends ParserRecord>(
  conditions: ConditionMap<TParsers>,
  values: Partial<Record<keyof TParsers, unknown>>,
): SQL | undefined {
  const clauses = Object.keys(conditions).flatMap((key) => {
    const value = values[key as keyof TParsers];

    return value === null || value === undefined || value === ""
      ? []
      : [conditions[key as keyof TParsers](value as never)];
  });

  return and(...clauses);
}

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export function toggleSort<TSortKey extends string>(
  current: SortState<TSortKey>,
  key: TSortKey,
  defaultDirection: SortDirection = "desc",
): SortPatch<TSortKey> {
  const dir: SortDirection =
    current.sort !== key
      ? defaultDirection
      : current.dir === "asc"
        ? "desc"
        : "asc";

  return { sort: key, dir, page: null };
}

type SortDefinition<TSortKey extends string> = {
  readonly columns: Readonly<Record<TSortKey, PgColumn>>;
  readonly toOrderBy: (
    key: TSortKey,
    direction: SortDirection,
  ) => readonly [SQL, SQL];
};

export function defineSort<TSortKey extends string>(
  columns: Readonly<Record<TSortKey, PgColumn>>,
  tiebreaker: PgColumn,
): SortDefinition<TSortKey> {
  return {
    columns,
    toOrderBy: (key: TSortKey, direction: SortDirection) =>
      [
        direction === "asc" ? asc(columns[key]) : desc(columns[key]),
        desc(tiebreaker),
      ] as const,
  };
}
