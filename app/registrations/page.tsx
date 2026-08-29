// app/registrations/test-page.tsx
"use client";

import { createWaitlistItemAction } from "@/lib/actions/waitlist-items";
import { useAction } from "next-safe-action/hooks";

export default function TestPage() {
  const { execute, result, isPending } = useAction(createWaitlistItemAction);

  return (
    <div style={{ padding: 24 }}>
      <button
        disabled={isPending}
        onClick={() =>
          execute({
            patient: { firstName: "Test", lastName: "Patiënt" },
            guardians: [
              { firstName: "Ouder", lastName: "Een", tel: "0470000001" },
            ],
            registration: {
              supportNeed: "Diagnostisch onderzoek",
              registrationMethod: "phone",
            },
            waitlistItem: { waitlistType: "diagnostics" },
          })
        }
      >
        {isPending ? "Bezig..." : "Test aanmaken"}
      </button>

      {result.validationErrors && (
        <pre>{JSON.stringify(result.validationErrors, null, 2)}</pre>
      )}
      {result.data && <p>Aangemaakt: {result.data.id}</p>}
      {result.serverError && <p>Fout: {result.serverError}</p>}
    </div>
  );
}
