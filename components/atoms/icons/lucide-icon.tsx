import type { LucideProps } from "lucide-react";
import {
  type IconName,
  type IconSize,
  Icons,
  sizeMap,
} from "@/lib/types/icons";

type IconProps = Omit<LucideProps, "size"> & {
  name: IconName;
  size?: IconSize;
};

export default function LucideIcon({ name, size = "sm", ...props }: IconProps) {
  const IconComponent = Icons[name];

  return <IconComponent size={sizeMap[size]} {...props} />;
}
