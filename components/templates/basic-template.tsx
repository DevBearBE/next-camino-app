import { cn } from "@/lib/utils/functions/styling";
import { HTMLProps } from "react";

type BasicTemplateProps = HTMLProps<HTMLElement>;

export default function BasicTemplate({
  children,
  className,
  ...props
}: BasicTemplateProps) {
  return (
    <main
      className={cn(
        "grow mt-4 px-4 py-3 flex flex-col bg-white rounded-tl-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
