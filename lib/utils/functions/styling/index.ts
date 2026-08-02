import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {},
  },
});

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(...inputs));
};
