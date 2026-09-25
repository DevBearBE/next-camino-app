import Button from "@/components/atoms/buttons/button";
import LucideIcon from "@/components/atoms/icons/lucide-icon";
import Heading from "@/components/atoms/typography/heading";
import { panelClasses } from "@/components/templates/basic-page-template";
import { cn } from "@/lib/utils/functions/styling";

export default function WaitlistNotFound() {
  return (
    <main className={cn(panelClasses, "items-center justify-center gap-y-4")}>
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-100">
        <LucideIcon name="circleAlert" size="md" className="text-accent-600" />
      </span>

      <Heading size="xl">Patiënt niet gevonden</Heading>
      <p className="max-w-md text-center text-ink-500">
        Dit wachtlijstdossier bestaat niet (meer) of de link klopt niet.
      </p>

      <Button href="/waitlist">Terug naar de wachtlijst</Button>
    </main>
  );
}
