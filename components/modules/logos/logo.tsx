import { cn } from "@/lib/utils/functions/styling";

type LogoProps = {
  readonly className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <h1 className={cn("font-extrabold text-3xl", className)}>
      Camino<span className="text-accent-500">.</span>
    </h1>
  );
}
