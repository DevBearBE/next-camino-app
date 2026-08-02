import { LogOut } from "lucide-react";

export const Icons = {
  logout: LogOut,
} as const;

export type IconName = keyof typeof Icons;

export const sizeMap = {
  xxs: "16px",
  xs: "20px",
  sm: "24px",
  md: "28px",
  lg: "32px",
  xl: "36px",
  "2xl": "40px",
  "3xl": "44px",
  "4xl": "48px",
} as const;

export type IconSize = keyof typeof sizeMap;
