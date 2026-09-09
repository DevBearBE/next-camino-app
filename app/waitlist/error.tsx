"use client";

import Button from "@/components/atoms/buttons/button";
import LucideIcon from "@/components/atoms/icons/lucide-icon";
import Heading from "@/components/atoms/typography/heading";
import { useEffect } from "react";

export default function WaitlistError({
  error,
  retry,
}: {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grow mt-4 flex flex-col items-center justify-center gap-y-4 bg-white rounded-tl-2xl">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-100">
        <LucideIcon name="circleAlert" size="md" className="text-accent-600" />
      </span>

      <Heading size="xl">De wachtlijst kon niet geladen worden</Heading>
      <p className="max-w-md text-center text-ink-500">
        Er ging iets mis bij het ophalen van de aanmeldingen. Probeer het
        opnieuw — blijft dit gebeuren, verwittig dan de coördinator.
      </p>
      {error.digest && (
        <p className="text-sm text-ink-500">Referentie: {error.digest}</p>
      )}

      <Button onClick={retry}>Opnieuw proberen</Button>
    </main>
  );
}
