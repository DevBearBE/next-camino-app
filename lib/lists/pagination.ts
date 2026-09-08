export const PAGE_SIZE = 25;

const toSafePage = (page: number): number =>
  Number.isFinite(page) ? Math.trunc(page) : 1;

export function toPageCount(total: number, pageSize: number = PAGE_SIZE): number {
  if (total <= 0 || pageSize <= 0) return 0;

  return Math.ceil(total / pageSize);
}

export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(toSafePage(page), 1), Math.max(pageCount, 1));
}

export function toOffset(page: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(toSafePage(page) - 1, 0) * pageSize;
}

export function toPageWindow(
  page: number,
  pageCount: number,
  span: number = 2,
): readonly number[] {
  if (pageCount < 1) return [];

  const width = span * 2 + 1;
  const current = clampPage(page, pageCount);
  const start = Math.max(1, Math.min(current - span, pageCount - width + 1));
  const end = Math.min(pageCount, Math.max(current + span, width));

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
