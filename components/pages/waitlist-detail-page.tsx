"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/buttons/button";
import DeleteWaitlistItemButton from "@/components/atoms/buttons/delete-waitlist-item-button";
import OtherWaitlistsStrip, {
  type OtherWaitlistsStripEntry,
} from "@/components/modules/waitlist-items/other-waitlists-strip";
import WaitlistItemDetailForm, {
  DETAIL_FORM_ID,
} from "@/components/organisms/form/waitlist-items/waitlist-item-detail-form";
import BasicPageTemplate from "@/components/templates/basic-page-template";
import { isStatusInView } from "@/lib/db/enums";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { WaitlistItemDetail } from "@/lib/types/waitlist-items";
import { formatFullName } from "@/lib/utils/functions/helpers";

type WaitlistDetailPageProps = {
  readonly detail: WaitlistItemDetail;
  readonly version: string;
  readonly listHref: string;
  readonly otherEntries: readonly OtherWaitlistsStripEntry[];
};

export default function WaitlistDetailPage({
  detail,
  version,
  listHref,
  otherEntries,
}: WaitlistDetailPageProps) {
  const router = useRouter();
  const [isPendingSubmit, setIsPendingSubmit] = useState(false);
  const isHandled = isStatusInView(
    detail.waitlistItem.planningStatus,
    "handled",
  );

  return (
    <BasicPageTemplate
      title={formatFullName(detail.patient)}
      beforeContent={
        <OtherWaitlistsStrip
          current={waitlistTypeLabels[detail.waitlistItem.waitlistType]}
          entries={otherEntries}
        />
      }
      actionButton={
        <div className="flex items-center gap-x-3">
          {isHandled && (
            <div className="mr-2 border-r-2 border-primary-250 py-1.5 pr-5">
              <DeleteWaitlistItemButton
                waitlistItemId={detail.waitlistItem.id}
                name={formatFullName(detail.patient)}
                disabled={isPendingSubmit}
                onDeletedAction={() => router.push(listHref)}
              />
            </div>
          )}
          <Button
            href={listHref}
            variant="ghost"
            leftIcon="x"
            leftIconSize="xxs"
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            form={DETAIL_FORM_ID}
            leftIcon="check"
            leftIconSize="xxs"
            disabled={isPendingSubmit}
          >
            {isPendingSubmit ? "Bezig.." : "Opslaan"}
          </Button>
        </div>
      }
    >
      <WaitlistItemDetailForm
        detail={detail}
        version={version}
        listHref={listHref}
        onPendingStateAction={setIsPendingSubmit}
      />
    </BasicPageTemplate>
  );
}
