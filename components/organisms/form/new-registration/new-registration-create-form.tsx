"use client";

import Button from "@/components/atoms/buttons/button";
import DateInput from "@/components/atoms/form/date-input";
import Input from "@/components/atoms/form/input";
import Select from "@/components/atoms/form/select";
import Textarea from "@/components/atoms/form/textarea";
import GuardianInput from "@/components/modules/form/guardian-input";
import { createWaitlistItemAction } from "@/lib/actions/waitlist-items";
import {
  buildGuardianFieldErrors,
  flattenNestedValidationErrors,
  registrationMethodOptions,
  waitlistTypeOptions,
} from "@/lib/utils/functions/form";
import { emptyToUndefined } from "@/lib/utils/functions/helpers";
import { cn } from "@/lib/utils/functions/styling";
import { toastManager } from "@/lib/utils/toasts/toast-manager";
import { Form } from "@base-ui/react/form";
import { useAction } from "next-safe-action/hooks";
import { SubmitEvent, useEffect, useState } from "react";

type NewRegistrationCreateFormProps = {
  readonly onSuccessAction: () => void;
  readonly onPendingStateAction: (pending: boolean) => void;
  readonly className?: string;
};

function extractGuardiansFromFormData(formData: FormData) {
  const guardianEntries = Array.from(formData.entries()).flatMap(
    ([key, value]) => {
      const match = key.match(/^guardians\.([^.]+)\.(.+)$/);
      if (!match || typeof value !== "string") return [];
      const [, rowId, fieldName] = match;
      return [{ rowId, fieldName, value }];
    },
  );

  const fieldsByGuardian = guardianEntries.reduce<
    Record<string, Record<string, string>>
  >(
    (acc, { rowId, fieldName, value }) => ({
      ...acc,
      [rowId]: { ...acc[rowId], [fieldName]: value },
    }),
    {},
  );

  return Object.values(fieldsByGuardian).map((fields) => ({
    firstName: fields.firstName ?? "",
    lastName: fields.lastName ?? "",
    tel: emptyToUndefined(fields.tel ?? null),
    email: emptyToUndefined(fields.email ?? null),
  }));
}

function buildCreateWaitlistItemPayload(formData: FormData) {
  return {
    patient: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      tel: emptyToUndefined(formData.get("tel")),
      email: emptyToUndefined(formData.get("email")),
      dob: emptyToUndefined(formData.get("dob")),
    },
    guardians: extractGuardiansFromFormData(formData),
    registration: {
      supportNeed: formData.get("supportNeed") as string,
      registrationMethod: formData.get("registrationMethod") as
        "mail" | "phone",
      additionalNotes: emptyToUndefined(formData.get("additionalNotes")),
    },
    waitlistItem: {
      waitlistType: formData.get("waitlistType") as
        "diagnostics" | "psychological_support" | "child_psychiatric_support",
    },
  };
}

export default function NewRegistrationCreateForm({
  onSuccessAction,
  onPendingStateAction,
  className,
}: NewRegistrationCreateFormProps) {
  const [guardianIds, setGuardianIds] = useState<Array<string>>([]);
  const { execute, result, isPending } = useAction(createWaitlistItemAction, {
    onSuccess: () => {
      toastManager.add({
        title: "Aanmelding opgeslagen",
        type: "success",
      });
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
  });

  useEffect(() => {
    onPendingStateAction(isPending);
  }, [isPending, onPendingStateAction]);

  const addGuardian = (): void => {
    setGuardianIds((prev) => [...prev, crypto.randomUUID()]);
  };

  const removeGuardian = (id: string): void => {
    setGuardianIds((prev) => prev.filter((existingId) => existingId !== id));
  };

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    execute(buildCreateWaitlistItemPayload(new FormData(event.currentTarget)));
  };

  const validationErrors = result.validationErrors as
    | {
        patient?: unknown;
        registration?: unknown;
        waitlistItem?: unknown;
        guardians?: Record<string, unknown>;
      }
    | undefined;

  const fieldErrors: Record<string, string> = {
    ...flattenNestedValidationErrors({
      patient: validationErrors?.patient,
      registration: validationErrors?.registration,
      waitlistItem: validationErrors?.waitlistItem,
    }),
    ...buildGuardianFieldErrors(validationErrors?.guardians, guardianIds),
  };

  return (
    <Form
      id="new-registration-form"
      className={cn("flex flex-col gap-y-8", className)}
      errors={fieldErrors}
      onSubmit={handleSubmit}
    >
      <section className="px-8 py-4 grid grid-cols-2 gap-6">
        <Input name="firstName" label="Voornaam" required />
        <Input name="lastName" label="Achternaam" required />
        <Input name="tel" label="Telefoonnummer" />
        <Input name="email" label="E-mail" />
        <DateInput name="dob" label="Geboortedatum" />
      </section>
      <section className="px-8 py-4 flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <p className="font-extrabold uppercase tracking-wider">Ouders</p>
          <Button
            type="button"
            variant="ghost"
            leftIcon="plus"
            leftIconSize="xxs"
            onClick={addGuardian}
          >
            Ouder toevoegen
          </Button>
        </div>

        {guardianIds.map((id, index) => (
          <GuardianInput
            key={id}
            id={id}
            index={index}
            onRemoveAction={() => removeGuardian(id)}
          />
        ))}
      </section>
      <section className="px-8 py-4 flex flex-col gap-y-6">
        <Input name="supportNeed" label="Aanmeldingsreden" required />
        <section className="grid grid-cols-2 gap-6">
          <Select
            name="registrationMethod"
            label="Aanmeldingswijze"
            options={registrationMethodOptions}
            required
          />
          <Select
            name="waitlistType"
            label="Type traject"
            options={waitlistTypeOptions}
            required
          />
        </section>
        <Textarea name="additionalNotes" label="Notities" rows={4} />
      </section>
    </Form>
  );
}
