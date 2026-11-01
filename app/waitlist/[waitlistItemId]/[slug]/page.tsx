import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import WaitlistDetailPage from "@/components/pages/waitlist-detail-page";
import { findWaitlistItemById } from "@/lib/db/queries/waitlist-items/select";
import { planningStatusLabels } from "@/lib/i18n/planning-status-labels";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import {
  loadWaitlistParams,
  serializeWaitlistParams,
} from "@/lib/lists/waitlist-items/search-params";
import { formatFullName, slugify } from "@/lib/utils/functions/helpers";
import { computeRecordVersion } from "@/lib/utils/functions/record-version";

type WaitlistDetailRouteParams = {
  readonly params: Promise<{ waitlistItemId: string; slug: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FALLBACK_TITLE = "Wachtlijstdossier";

export async function generateMetadata({
  params,
}: WaitlistDetailRouteParams): Promise<Metadata> {
  const { userId } = await auth();
  const { waitlistItemId } = await params;
  if (!userId || !z.uuid().safeParse(waitlistItemId).success) {
    return { title: FALLBACK_TITLE };
  }

  const detail = await findWaitlistItemById(waitlistItemId);
  return { title: detail ? formatFullName(detail.patient) : FALLBACK_TITLE };
}

export default async function WaitlistDetail({
  params,
  searchParams,
}: WaitlistDetailRouteParams) {
  const { userId } = await auth();
  if (!userId) return null;

  const { waitlistItemId } = await params;
  if (!z.uuid().safeParse(waitlistItemId).success) notFound();

  const detail = await findWaitlistItemById(waitlistItemId);
  if (!detail) notFound();

  const serializedParams = serializeWaitlistParams(
    loadWaitlistParams(await searchParams),
  );
  const slug = slugify(formatFullName(detail.patient));

  return (
    <WaitlistDetailPage
      detail={detail}
      listHref={`/waitlist${serializedParams}`}
      otherEntries={detail.otherEntries.map((entry) => ({
        id: entry.id,
        label: waitlistTypeLabels[entry.waitlistType],
        status: planningStatusLabels[entry.planningStatus],
        href: `/waitlist/${entry.id}/${slug}${serializedParams}`,
      }))}
      version={computeRecordVersion(
        detail.waitlistItem.updatedAt,
        detail.patient,
        detail.guardians,
      )}
    />
  );
}
