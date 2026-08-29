"use client";

import Button from "@/components/atoms/buttons/button";
import DateInput from "@/components/atoms/form/date-input";
import Input from "@/components/atoms/form/input";
import Select from "@/components/atoms/form/select";
import Textarea from "@/components/atoms/form/textarea";
import { createWaitlistItemAction } from "@/lib/actions/waitlist-items";
import {
  flattenNestedValidationErrors,
  registrationMethodOptions,
  waitlistTypeOptions,
} from "@/lib/utils/functions/form";
import { emptyToUndefined } from "@/lib/utils/functions/helpers";
import { cn } from "@/lib/utils/functions/styling";
import { Form } from "@base-ui/react/form";
import { useAction } from "next-safe-action/hooks";
import { SubmitEvent, useEffect } from "react";

type NewRegistrationCreateFormProps = {
  readonly onSuccessAction: () => void;
  readonly onPendingStateAction: (pending: boolean) => void;
  readonly className?: string;
};

function buildCreateWaitlistItemPayload(formData: FormData) {
  return {
    patient: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      tel: emptyToUndefined(formData.get("tel")),
      email: emptyToUndefined(formData.get("email")),
      dob: emptyToUndefined(formData.get("dateOfBirth")),
    },
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
  const { execute, result, isPending } = useAction(createWaitlistItemAction, {
    onSuccess: (args) => {
      console.log("onSuccess fired with:", args);
      onSuccessAction();
    },
    onError: (args) => {
      console.log("onError fired with:", args);
    },
  });

  useEffect(() => {
    onPendingStateAction(isPending);
  }, [isPending, onPendingStateAction]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    execute(buildCreateWaitlistItemPayload(new FormData(event.currentTarget)));
  };

  const fieldErrors = result.validationErrors
    ? flattenNestedValidationErrors(result.validationErrors)
    : {};

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

      {result.serverError && (
        <p className="px-8 text-sm text-red-600">{result.serverError}</p>
      )}
    </Form>
  );
}
