import { cn } from "@/lib/utils/functions/styling";

export type BadgeTone =
  | "neutral"
  | "info"
  | "warning"
  | "danger"
  | "success"
  | "caution";

type StatusBadgeProps = {
  readonly tone: BadgeTone;
  readonly label: string;
  readonly className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-status-new-bg text-status-new",
  info: "bg-priority-medium-bg text-priority-medium",
  warning: "bg-status-contacted-bg text-status-contacted",
  danger: "bg-status-awaiting-bg text-status-awaiting",
  success: "bg-status-planned-bg text-status-planned",
  caution: "bg-priority-high-bg text-priority-high",
};

export default function StatusBadge({
  tone,
  label,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
