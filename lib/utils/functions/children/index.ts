import type { WaitlistType } from "@/lib/db/enums";

export function pickPrefillSource<T extends { createdAt: Date | null }>(
  registrations: readonly T[],
): T | undefined {
  return registrations.reduce<T | undefined>((newest, candidate) => {
    if (!newest) return candidate;
    if (!candidate.createdAt) return newest;
    if (!newest.createdAt) return candidate;

    return candidate.createdAt > newest.createdAt ? candidate : newest;
  }, undefined);
}

export function availableWaitlistTypes(
  all: readonly WaitlistType[],
  taken: readonly WaitlistType[],
): WaitlistType[] {
  return all.filter((type) => !taken.includes(type));
}
