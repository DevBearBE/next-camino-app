import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PAGE_SIZE,
  clampPage,
  toOffset,
  toPageCount,
  toPageWindow,
} from "./pagination.ts";

test("toPageCount returns 0 for an empty result set", () => {
  assert.equal(toPageCount(0), 0);
});

test("toPageCount rounds a partial last page up", () => {
  assert.equal(toPageCount(1), 1);
  assert.equal(toPageCount(26), 2);
  assert.equal(toPageCount(51), 3);
});

test("toPageCount does not add a page on exact multiples", () => {
  assert.equal(toPageCount(25), 1);
  assert.equal(toPageCount(50), 2);
});

test("toOffset starts the first page at zero", () => {
  assert.equal(toOffset(1), 0);
  assert.equal(toOffset(3), 50);
});

test("toOffset clamps the lower bound so OFFSET is never negative", () => {
  assert.equal(toOffset(0), 0);
  assert.equal(toOffset(-5), 0);
  assert.equal(toOffset(Number.NaN), 0);
});

test("clampPage pins a page past the end to the last page", () => {
  assert.equal(clampPage(99, 4), 4);
});

test("clampPage pins a page below the start to the first page", () => {
  assert.equal(clampPage(0, 4), 1);
  assert.equal(clampPage(-5, 4), 1);
});

test("clampPage survives an empty result set", () => {
  assert.equal(clampPage(1, 0), 1);
});

test("toPageWindow is empty when there are no pages", () => {
  assert.deepEqual(toPageWindow(1, 0), []);
});

test("toPageWindow returns every page when they all fit", () => {
  assert.deepEqual(toPageWindow(1, 3), [1, 2, 3]);
});

test("toPageWindow centres on the current page in the middle of a long list", () => {
  assert.deepEqual(toPageWindow(5, 10), [3, 4, 5, 6, 7]);
});

test("toPageWindow holds its width at both ends", () => {
  assert.deepEqual(toPageWindow(1, 10), [1, 2, 3, 4, 5]);
  assert.deepEqual(toPageWindow(10, 10), [6, 7, 8, 9, 10]);
});

test("toPageWindow clamps an out-of-range page before centring", () => {
  assert.deepEqual(toPageWindow(99, 10), [6, 7, 8, 9, 10]);
  assert.deepEqual(toPageWindow(-5, 10), [1, 2, 3, 4, 5]);
});

test("PAGE_SIZE is the single source of the page size", () => {
  assert.equal(PAGE_SIZE, 25);
  assert.equal(toOffset(2), PAGE_SIZE);
});
