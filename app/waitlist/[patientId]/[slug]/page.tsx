import WaitlistDetailPage from "@/components/pages/waitlist-detail-page";
import {
  loadWaitlistParams,
  serializeWaitlistParams,
} from "@/lib/lists/waitlist-items/search-params";
import { findWaitlistItemByPatientId } from "@/lib/db/queries/waitlist-items/select";
import { formatFullName } from "@/lib/utils/functions/helpers";
import { computeRecordVersion } from "@/lib/utils/functions/record-version";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

type WaitlistDetailRouteParams = {
  readonly params: Promise<{ patientId: string; slug: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FALLBACK_TITLE = "Wachtlijstdossier";

export async function generateMetadata({
  params,
}: WaitlistDetailRouteParams): Promise<Metadata> {
  const { userId } = await auth();
  const { patientId } = await params;
  if (!userId || !z.uuid().safeParse(patientId).success) {
    return { title: FALLBACK_TITLE };
  }

  const detail = await findWaitlistItemByPatientId(patientId);
  return { title: detail ? formatFullName(detail.patient) : FALLBACK_TITLE };
}

export default async function WaitlistDetail({
  params,
  searchParams,
}: WaitlistDetailRouteParams) {
  const { userId } = await auth();
  if (!userId) return null;

  const { patientId } = await params;
  if (!z.uuid().safeParse(patientId).success) notFound();

  const detail = await findWaitlistItemByPatientId(patientId);
  if (!detail) notFound();

  return (
    <WaitlistDetailPage
      detail={detail}
      listHref={`/waitlist${serializeWaitlistParams(loadWaitlistParams(await searchParams))}`}
      version={computeRecordVersion(
        detail.waitlistItem.updatedAt,
        detail.guardians,
      )}
    />
  );
}
