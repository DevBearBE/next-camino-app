import { formatInitials } from "@/lib/utils/functions/helpers";
import { cn } from "@/lib/utils/functions/styling";

type AvatarProps = {
  readonly firstName: string;
  readonly lastName: string;
};

export default function Avatar({ firstName, lastName }: AvatarProps) {
  const initials = formatInitials({ firstName, lastName });

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-accent-100 text-accent-600 font-bold flex items-center justify-center",
        initials.length > 2 && "text-xs",
      )}
    >
      {initials}
    </div>
  );
}
