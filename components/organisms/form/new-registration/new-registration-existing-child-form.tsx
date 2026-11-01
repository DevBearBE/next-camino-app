"use client";

import { Form } from "@base-ui/react/form";
import { useAction } from "next-safe-action/hooks";
import { type SubmitEvent, useEffect, useState } from "react";
import Button from "@/components/atoms/buttons/button";
import Input from "@/components/atoms/form/input";
import Select from "@/components/atoms/form/select";
import Textarea from "@/components/atoms/form/textarea";
import Heading from "@/components/atoms/typography/heading";
import ChildSearch from "@/components/modules/form/child-search";
import { addWaitlistItemToChildAction } from "@/lib/actions/waitlist-items";
import { waitlistTypeValues } from "@/lib/db/enums";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";
import type { ChildSearchResult } from "@/lib/types/children";
import { availableWaitlistTypes } from "@/lib/utils/functions/children";
import {
  flattenNestedValidationErrors,
  registrationMethodOptions,
  waitlistTypeOptions,
} from "@/lib/utils/functions/form";
import {
  emptyToUndefined,
  formatFullName,
  formatIsoDate,
} from "@/lib/utils/functions/helpers";
import { cn } from "@/lib/utils/functions/styling";
import { toastManager } from "@/lib/utils/toasts/toast-manager";

type NewRegistrationExistingChildFormProps = {
  readonly onSuccessAction: () => void;
  readonly onPendingStateAction: (pending: boolean) => void;
  readonly onSubmitBlockedAction: (blocked: boolean) => void;
  readonly className?: string;
};

export default function NewRegistrationExistingChildForm({
  onSuccessAction,
  onPendingStateAction,
  onSubmitBlockedAction,
  className,
}: NewRegistrationExistingChildFormProps) {
  const [child, setChild] = useState<ChildSearchResult | null>(null);
  const { execute, result, isPending } = useAction(
    addWaitlistItemToChildAction,
    {
      onSuccess: () => {
        toastManager.add({ title: "Aanmelding opgeslagen", type: "success" });
        onSuccessAction();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toastManager.add({
            title: "Er ging iets mis..",
            description: error.serverError,
            type: "error",
          });
        }
      },
    },
  );

  const freeTypes = child
    ? availableWaitlistTypes(waitlistTypeValues, child.takenTypes)
    : [];
  const isBlocked = !child || freeTypes.length === 0;

  useEffect(() => {
    onPendingStateAction(isPending);
  }, [isPending, onPendingStateAction]);

  useEffect(() => {
    onSubmitBlockedAction(isBlocked);
  }, [isBlocked, onSubmitBlockedAction]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!child) return;

    const formData = new FormData(event.currentTarget);

    execute({
      patientId: child.patientId,
      waitlistType: formData.get(
        "waitlistType",
      ) as (typeof waitlistTypeValues)[number],
      registration: {
        supportNeed: formData.get("supportNeed") as string,
        registrationMethod: formData.get("registrationMethod") as
          | "mail"
          | "phone",
        additionalNotes: emptyToUndefined(formData.get("additionalNotes")),
      },
    });
  };

  const validationErrors = result.validationErrors as
    | { waitlistType?: unknown; registration?: unknown }
    | undefined;

  const fieldErrors = flattenNestedValidationErrors({
    waitlistType: validationErrors?.waitlistType,
    registration: validationErrors?.registration,
  });

  return (
    <Form
      id="new-registration-form"
      className={cn("flex flex-col gap-y-8 px-8 py-4", className)}
      errors={fieldErrors}
      onSubmit={handleSubmit}
    >
      {child ? (
        <>
          <section className="flex flex-col gap-y-3">
            <div className="flex items-start justify-between gap-x-4 rounded-xl bg-primary-50 px-4 py-3 shadow-soft">
              <div className="text-sm">
                <p className="text-base font-semibold">
                  {formatFullName(child)}
                </p>
                <p className="text-ink-500">{formatIsoDate(child.dob)}</p>
                {child.guardianNames.length > 0 && (
                  <p className="text-ink-500">
                    Ouder: {child.guardianNames.join(", ")}
                  </p>
                )}
                <p className="text-ink-400">
                  Al op:{" "}
                  {child.takenTypes
                    .map((type) => waitlistTypeLabels[type])
                    .join(", ")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setChild(null)}
              >
                Ander kind
              </Button>
            </div>
          </section>

          {freeTypes.length === 0 ? (
            <p className="text-sm text-ink-500">
              Dit kind staat al op alle wachtlijsten.
            </p>
          ) : (
            <section key={child.patientId}>
              <Heading className="text-primary-400 flex gap-1.5 font-black uppercase tracking-wider">
                <span className="text-accent-500">02.</span>Aanmeldingsgegevens
              </Heading>
              <div className="py-4 flex flex-col gap-y-6">
                <Input
                  name="supportNeed"
                  label="Aanmeldingsreden"
                  defaultValue={child.prefill.supportNeed}
                  required
                />
                <div className="grid grid-cols-2 gap-6">
                  <Select
                    name="registrationMethod"
                    label="Aanmeldingswijze"
                    options={registrationMethodOptions}
                    defaultValue={child.prefill.registrationMethod}
                    required
                  />
                  <Select
                    name="waitlistType"
                    label="Type traject"
                    options={waitlistTypeOptions.map((option) => {
                      const isTaken = child.takenTypes.some(
                        (type) => type === option.value,
                      );

                      return {
                        ...option,
                        label: isTaken
                          ? `${option.label} (al aangemeld)`
                          : option.label,
                        disabled: isTaken,
                      };
                    })}
                    required
                  />
                </div>
                <Textarea
                  name="additionalNotes"
                  label="Notities"
                  rows={4}
                  defaultValue={child.prefill.additionalNotes ?? undefined}
                />
              </div>
            </section>
          )}
        </>
      ) : (
        <ChildSearch onSelectAction={setChild} />
      )}
    </Form>
  );
}
