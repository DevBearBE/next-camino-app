"use client";

import Button from "@/components/atoms/buttons/button";
import WaitlistItemDetailForm, {
  DETAIL_FORM_ID,
} from "@/components/organisms/form/waitlist-items/waitlist-item-detail-form";
import BasicPageTemplate from "@/components/templates/basic-page-template";
import type { WaitlistItemDetail } from "@/lib/types/waitlist-items";
import { formatFullName } from "@/lib/utils/functions/helpers";
import { useState } from "react";

type WaitlistDetailPageProps = {
  readonly detail: WaitlistItemDetail;
  readonly version: string;
};

export default function WaitlistDetailPage({
  detail,
  version,
}: WaitlistDetailPageProps) {
  const [isPendingSubmit, setIsPendingSubmit] = useState(false);

  return (
    <BasicPageTemplate
      title={formatFullName(detail.patient)}
      actionButton={
        <div className="flex items-center gap-x-3">
          <Button
            href="/waitlist"
            variant="destructive"
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
        onPendingStateAction={setIsPendingSubmit}
      />
    </BasicPageTemplate>
  );
}
