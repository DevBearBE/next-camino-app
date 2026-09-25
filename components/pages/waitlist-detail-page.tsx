import Button from "@/components/atoms/buttons/button";
import BasicPageTemplate from "@/components/templates/basic-page-template";
import { PropsWithChildren } from "react";

type WaitlistDetailPageProps = PropsWithChildren<{
  readonly title: string;
}>;

export default function WaitlistDetailPage({
  title,
  children,
}: WaitlistDetailPageProps) {
  return (
    <BasicPageTemplate
      title={title}
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
          <Button href="/waitlist" leftIcon="check" leftIconSize="xxs">
            Opslaan
          </Button>
        </div>
      }
    >
      {children}
    </BasicPageTemplate>
  );
}
