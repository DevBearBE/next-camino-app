import {
  Icons,
  sizeMap,
  type IconName,
  type IconSize,
} from "@/lib/types/icons";
import { type LucideProps } from "lucide-react";

type IconProps = Omit<LucideProps, "size"> & {
  name: IconName;
  size?: IconSize;
};

export default function LucideIcon({ name, size = "sm", ...props }: IconProps) {
  const IconComponent = Icons[name];

  return <IconComponent size={sizeMap[size]} {...props} />;
}
