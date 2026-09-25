"use client";

import Button from "@/components/atoms/buttons/button";
import DateInput from "@/components/atoms/form/date-input";
import Input from "@/components/atoms/form/input";
import Select from "@/components/atoms/form/select";
import Textarea from "@/components/atoms/form/textarea";
import Heading from "@/components/atoms/typography/heading";
import GuardianInput from "@/components/modules/form/guardian-input";
import type { WaitlistItemDetail } from "@/lib/types/waitlist-items";
import {
  contactStatusOptions,
  planningStatusOptions,
  registrationMethodOptions,
  waitlistTypeOptions,
} from "@/lib/utils/functions/form";
import {
  formatDate,
  formatWaitingTime,
  toDateInputValue,
} from "@/lib/utils/functions/helpers";
import { cn } from "@/lib/utils/functions/styling";
import { useState } from "react";

type WaitlistItemDetailFormProps = {
  readonly detail: WaitlistItemDetail;
};

function ReadOnlyField({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="font-extrabold flex items-center gap-x-1 tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-primary-800">{value}</p>
    </div>
  );
}

export default function WaitlistItemDetailForm({
  detail,
}: WaitlistItemDetailFormProps) {
  const { waitlistItem, registration, patient, guardians } = detail;
  const [guardianIds, setGuardianIds] = useState(
    guardians.map((guardian) => guardian.id),
  );
  const guardianById = new Map(
    guardians.map((guardian) => [guardian.id, guardian]),
  );

  const addGuardian = (): void => {
    setGuardianIds((prev) => [...prev, crypto.randomUUID()]);
  };

  const removeGuardian = (id: string): void => {
    setGuardianIds((prev) => prev.filter((existingId) => existingId !== id));
  };

  const card = "bg-primary-50 shadow-soft rounded-2xl p-6";
  const sectionLabel = "text-xs font-bold uppercase tracking-wide text-ink-400";

  return (
    <div className="flex flex-col gap-y-10 px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <section>
          <Heading className="text-primary-400 flex gap-1.5 font-black uppercase tracking-wider">
            <span className="text-accent-500">01.</span>Wachtlijst &amp;
            registratie
          </Heading>

          <div className="mt-4 flex flex-col gap-y-4">
            <p className={sectionLabel}>Aanmelding</p>
            <div className={cn(card, "grid grid-cols-2 gap-6")}>
              <Select
                name="waitlistType"
                label="Type traject"
                options={waitlistTypeOptions}
                defaultValue={waitlistItem.waitlistType}
                required
              />
              <Select
                name="registrationMethod"
                label="Aanmeldingswijze"
                options={registrationMethodOptions}
                defaultValue={registration.registrationMethod}
                required
              />
              <Select
                name="contactStatus"
                label="Contactstatus"
                options={contactStatusOptions}
                defaultValue={waitlistItem.contactStatus}
                required
              />
              <Select
                name="planningStatus"
                label="Planningsstatus"
                options={planningStatusOptions}
                defaultValue={waitlistItem.planningStatus}
                required
              />
              <ReadOnlyField
                label="Aangemeld op"
                value={formatDate(registration.createdAt)}
              />
              <ReadOnlyField
                label="Aangemeld door"
                value={registration.createdBy}
              />
              <ReadOnlyField
                label="Wachttijd"
                value={formatWaitingTime(waitlistItem.createdAt)}
              />
            </div>

            <div className={card}>
              <Input
                name="supportNeed"
                label="Aanmeldingsreden"
                defaultValue={registration.supportNeed}
                required
              />
            </div>

            <div className={card}>
              <Textarea
                name="additionalNotes"
                label="Notities"
                rows={4}
                defaultValue={registration.additionalNotes ?? undefined}
              />
            </div>

            <p className={sectionLabel}>Intake</p>
            <div className={cn(card, "grid grid-cols-2 gap-6")}>
              <DateInput
                name="intakeAt"
                label="Intakedatum"
                defaultValue={toDateInputValue(waitlistItem.intakeAt)}
              />
              <Input
                name="intakeBy"
                label="Intake door"
                defaultValue={waitlistItem.intakeBy ?? undefined}
              />
            </div>
          </div>
        </section>

        <section>
          <Heading className="text-primary-400 flex gap-1.5 font-black uppercase tracking-wider">
            <span className="text-accent-500">02.</span>Persoonlijke gegevens
          </Heading>

          <div className="mt-4 flex flex-col gap-y-4">
            <div className={cn(card, "flex flex-col gap-y-6")}>
              <Input
                name="firstName"
                label="Voornaam"
                defaultValue={patient.firstName}
                required
              />
              <Input
                name="lastName"
                label="Achternaam"
                defaultValue={patient.lastName}
                required
              />
              <DateInput
                name="dob"
                label="Geboortedatum"
                defaultValue={patient.dob ?? undefined}
              />
              <Input
                name="tel"
                label="Telefoonnummer"
                defaultValue={patient.tel ?? undefined}
              />
              <Input
                name="email"
                label="E-mail"
                defaultValue={patient.email ?? undefined}
              />
            </div>

            <div className={card}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-extrabold tracking-wide">Ouders</p>
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
                  defaultValues={guardianById.get(id)}
                  singleColumn
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
