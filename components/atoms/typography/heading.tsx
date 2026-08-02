import { cn } from "@/lib/utils/functions/styling";
import { PropsWithChildren } from "react";

type HeadingProps = {
  readonly tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  readonly size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  readonly className?: string;
};

export default function Heading({
  tag: Tag = "h1",
  size = "md",
  className,
  ...props
}: PropsWithChildren<HeadingProps>) {
  const baseClasses = "font-bold";
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  return (
    <Tag className={cn(baseClasses, sizeClasses[size], className)} {...props} />
  );
}
