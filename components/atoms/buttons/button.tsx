import { IconName, IconSize } from "@/lib/types/icons";
import { cn } from "@/lib/utils/functions/styling";
import { HTMLProps } from "react";
import LucideIcon from "@/components/atoms/icons/lucide-icon";

type ButtonProps = HTMLProps<HTMLButtonElement> & {
  readonly variant?: "primary" | "ghost";
  readonly type?: "button" | "submit" | "reset";
  readonly leftIcon?: IconName;
  readonly leftIconSize?: IconSize;
  readonly leftIconColor?: string;
  readonly rightIcon?: IconName;
  readonly rightIconSize?: IconSize;
  readonly rightIconColor?: string;
};

export default function Button({
  variant = "primary",
  type = "button",
  leftIcon,
  leftIconSize,
  leftIconColor,
  rightIcon,
  rightIconSize,
  rightIconColor,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantClasses = cn(
    "px-6 py-2 font-semibold flex items-center gap-x-2 rounded-full cursor-pointer",
    {
      "bg-accent-500 text-white hover:bg-accent-600": variant === "primary",
      "hover:bg-primary-150": variant === "ghost",
    },
    className,
  );

  return (
    <button type={type} className={variantClasses} {...props}>
      {leftIcon && (
        <LucideIcon
          name={leftIcon}
          size={leftIconSize}
          className={leftIconColor}
        />
      )}
      {children}
      {rightIcon && (
        <LucideIcon
          name={rightIcon}
          size={rightIconSize}
          className={rightIconColor}
        />
      )}
    </button>
  );
}
