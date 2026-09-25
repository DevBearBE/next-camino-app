import BasicPageTemplate from "@/components/templates/basic-page-template";
import { PropsWithChildren } from "react";

type WaitlistDetailPageProps = PropsWithChildren<{
  readonly title: string;
}>;

export default function WaitlistDetailPage({
  title,
  children,
}: WaitlistDetailPageProps) {
  return <BasicPageTemplate title={title}>{children}</BasicPageTemplate>;
}
