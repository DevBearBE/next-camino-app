"use client";

import { cn } from "@/lib/utils/functions/styling";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavListItemProps = {
  readonly path: string;
  readonly label: string;
  readonly isExternalLink?: boolean;
};

export default function NavListItem({
  path,
  label,
  isExternalLink = false,
}: NavListItemProps) {
  const pathName = usePathname();
  const isActive = pathName.startsWith(path);

  const classes = cn(
    "grow px-3 py-1.5 text-primary-400 border-l-3 border-transparent rounded-lg",
    "transition-all ease-in-out duration-150",
    "hover:bg-white hover:shadow-card",
    {
      "text-primary-800 font-bold bg-white border-l-accent-700 shadow-card":
        isActive,
    },
  );

  return (
    <li className="flex">
      {isExternalLink ? (
        <a
          className={classes}
          href={path}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ) : (
        <Link className={classes} href={path}>
          {label}
        </Link>
      )}
    </li>
  );
}
