import assert from "node:assert/strict";
import { test } from "node:test";
import { sql } from "drizzle-orm";
import type { parseAsInteger, parseAsString } from "nuqs/server";
import { buildWhere, escapeLikePattern, toggleSort } from "./filters.ts";
import type { ConditionMap } from "./types.ts";

type Parsers = {
  readonly name: typeof parseAsString;
  readonly age: typeof parseAsInteger;
};

const conditions: ConditionMap<Parsers> = {
  name: (value) => sql`name = ${value}`,
  age: (value) => sql`age = ${value}`,
};

test("buildWhere returns undefined when no filter has a value", () => {
  assert.equal(buildWhere(conditions, {}), undefined);
  assert.equal(buildWhere(conditions, { name: null, age: null }), undefined);
});

test("buildWhere skips empty strings", () => {
  assert.equal(buildWhere(conditions, { name: "" }), undefined);
});

function spyConditions() {
  const calls: Array<readonly [string, unknown]> = [];
  const record = (key: string) => (value: unknown) => {
    calls.push([key, value]);
    return sql`${key}`;
  };

  return {
    calls,
    conditions: {
      name: record("name"),
      age: record("age"),
    } as ConditionMap<Parsers>,
  };
}

test("buildWhere invokes the condition for each filter that has a value", () => {
  const { calls, conditions: spies } = spyConditions();

  assert.ok(buildWhere(spies, { name: "jan", age: 40 }));
  assert.deepEqual(calls, [
    ["name", "jan"],
    ["age", 40],
  ]);
});

test("buildWhere never invokes a condition for an absent filter", () => {
  const { calls, conditions: spies } = spyConditions();

  buildWhere(spies, { name: null, age: undefined });
  assert.deepEqual(calls, []);
});

test("buildWhere ignores value keys that have no condition", () => {
  const { calls, conditions: spies } = spyConditions();

  const where = buildWhere(spies, {
    name: "jan",
    page: 3,
    sort: "createdAt",
  } as Record<string, unknown>);

  assert.ok(where);
  assert.deepEqual(calls, [["name", "jan"]]);
});

test("buildWhere keeps a zero value rather than treating it as absent", () => {
  const { calls, conditions: spies } = spyConditions();

  buildWhere(spies, { age: 0 });
  assert.deepEqual(calls, [["age", 0]]);
});

test("escapeLikePattern neutralises wildcards", () => {
  assert.equal(escapeLikePattern("100%"), "100\\%");
  assert.equal(escapeLikePattern("a_b"), "a\\_b");
  assert.equal(escapeLikePattern("back\\slash"), "back\\\\slash");
});

test("escapeLikePattern leaves ordinary text alone", () => {
  assert.equal(escapeLikePattern("jan de vries"), "jan de vries");
});

test("toggleSort flips direction when the key is unchanged", () => {
  assert.deepEqual(
    toggleSort({ sort: "createdAt", dir: "desc" }, "createdAt"),
    {
      sort: "createdAt",
      dir: "asc",
      page: null,
    },
  );
  assert.deepEqual(toggleSort({ sort: "createdAt", dir: "asc" }, "createdAt"), {
    sort: "createdAt",
    dir: "desc",
    page: null,
  });
});

test("toggleSort adopts the default direction for a new key", () => {
  assert.deepEqual(toggleSort({ sort: "createdAt", dir: "asc" }, "lastName"), {
    sort: "lastName",
    dir: "desc",
    page: null,
  });
});

test("toggleSort honours an overridden default direction", () => {
  assert.deepEqual(
    toggleSort({ sort: "createdAt", dir: "desc" }, "lastName", "asc"),
    { sort: "lastName", dir: "asc", page: null },
  );
});

test("toggleSort always resets the page", () => {
  assert.equal(toggleSort({ sort: "a", dir: "asc" }, "a").page, null);
  assert.equal(toggleSort({ sort: "a", dir: "asc" }, "b").page, null);
});
