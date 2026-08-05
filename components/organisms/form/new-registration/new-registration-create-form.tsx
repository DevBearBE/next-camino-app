"use client";

import DateInput from "@/components/atoms/form/date-input";
import Input from "@/components/atoms/form/input";
import Textarea from "@/components/atoms/form/textarea";
import { cn } from "@/lib/utils/functions/styling";
import { Form } from "@base-ui/react/form";
import { SubmitEvent } from "react";

type NewRegistrationCreateFormProps = {
  readonly onSuccessAction: () => void;
  readonly className?: string;
};

export default function NewRegistrationCreateForm({
  onSuccessAction,
  className,
}: NewRegistrationCreateFormProps) {
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());

    console.log(values);
    onSuccessAction();
  };

  return (
    <Form
      id="new-registration-form"
      className={cn("flex flex-col gap-y-12", className)}
      onSubmit={handleSubmit}
    >
      <section className="px-8 py-4 grid grid-cols-2 gap-6">
        <Input name="firstName" label="Voornaam" />
        <Input name="lastName" label="Achternaam" />
        <Input name="tel" label="Telefoonnummer" />
        <Input name="email" label="E-mail" />
        <DateInput name="dateOfBirth" label="Geboortedatum" />
      </section>
      <section className="px-8 py-4 flex flex-col gap-y-6">
        <Input name="supportNeed" label="Aanmeldingsreden" />
        <Textarea name="additionalNotes" label="Notities" rows={4} />
      </section>
    </Form>
  );
}
