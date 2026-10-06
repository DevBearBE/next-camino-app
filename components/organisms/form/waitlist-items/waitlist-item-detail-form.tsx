"use client";

import Button from "@/components/atoms/buttons/button";
import DateInput from "@/components/atoms/form/date-input";
import Input from "@/components/atoms/form/input";
import Select from "@/components/atoms/form/select";
import Textarea from "@/components/atoms/form/textarea";
import Heading from "@/components/atoms/typography/heading";
import GuardianInput from "@/components/modules/form/guardian-input";
import { updateWaitlistItemAction } from "@/lib/actions/waitlist-items";
import {
  planningStatusValues,
  type ContactStatus,
  type PlanningStatus,
  type RegistrationMethod,
  type WaitlistType,
} from "@/lib/db/enums";
import type { WaitlistItemDetail } from "@/lib/types/waitlist-items";
import {
  buildGuardianFieldErrors,
  contactStatusOptions,
  flattenNestedValidationErrors,
  planningStatusOptions,
  registrationMethodOptions,
  waitlistTypeOptions,
} from "@/lib/utils/functions/form";
import { extractGuardiansFromFormData } from "@/lib/utils/functions/guardians";
import {
  emptyToNull,
  formatDate,
  formatWaitingTime,
  toDateInputValue,
} from "@/lib/utils/functions/helpers";
import {
  PLANNED,
  planningStatusForIntake,
} from "@/lib/utils/functions/intake";
import { cn } from "@/lib/utils/functions/styling";
import { toastManager } from "@/lib/utils/toasts/toast-manager";
import { Form } from "@base-ui/react/form";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { SubmitEvent, useEffect, useState } from "react";

export const DETAIL_FORM_ID = "waitlist-item-detail-form";

type WaitlistItemDetailFormProps = {
  readonly detail: WaitlistItemDetail;
  readonly version: string;
  readonly onPendingStateAction: (pending: boolean) => void;
};

function buildUpdateWaitlistItemPayload(
  formData: FormData,
  patientId: string,
  version: string,
  planningStatus: PlanningStatus,
) {
  return {
    patientId,
    version,
    patient: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dob: emptyToNull(formData.get("dob")),
      tel: emptyToNull(formData.get("tel")),
      email: emptyToNull(formData.get("email")),
    },
    registration: {
      supportNeed: formData.get("supportNeed") as string,
      registrationMethod: formData.get(
        "registrationMethod",
      ) as RegistrationMethod,
      additionalNotes: emptyToNull(formData.get("additionalNotes")),
    },
    waitlistItem: {
      waitlistType: formData.get("waitlistType") as WaitlistType,
      contactStatus: formData.get("contactStatus") as ContactStatus,
      planningStatus,
      intakeAt: emptyToNull(formData.get("intakeAt")),
      intakeBy: emptyToNull(formData.get("intakeBy")),
    },
    guardians: extractGuardiansFromFormData(formData).map(
      ({ id, firstName, lastName, tel, email }) => ({
        id,
        firstName,
        lastName,
        tel: emptyToNull(tel),
        email: emptyToNull(email),
      }),
    ),
  };
}

export default function WaitlistItemDetailForm({
  detail,
  version,
  onPendingStateAction,
}: WaitlistItemDetailFormProps) {
  const { waitlistItem, registration, patient, guardians } = detail;
  const router = useRouter();
  const [guardianIds, setGuardianIds] = useState(
    guardians.map((guardian) => guardian.id),
  );
  const guardianById = new Map(
    guardians.map((guardian) => [guardian.id, guardian]),
  );
  const [intakeDate, setIntakeDate] = useState(
    toDateInputValue(waitlistItem.intakeAt),
  );
  const [chosenPlanningStatus, setChosenPlanningStatus] = useState(
    waitlistItem.planningStatus,
  );
  const planningStatus = planningStatusForIntake(
    intakeDate,
    chosenPlanningStatus,
  );
  const planningStatusChoices = intakeDate
    ? planningStatusOptions.filter((option) => option.value === PLANNED)
    : planningStatusOptions;

  const handlePlanningStatusChange = (status: string | null): void => {
    const next = planningStatusValues.find((value) => value === status);
    if (next) setChosenPlanningStatus(next);
  };
  const { execute, result, isPending, hasSucceeded } = useAction(
    updateWaitlistItemAction,
    {
      onSuccess: () => {
        toastManager.add({
          title: "Wijzigingen opgeslagen",
          type: "success",
        });
        router.push("/waitlist");
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
  const isLocked = isPending || hasSucceeded;

  useEffect(() => {
    onPendingStateAction(isLocked);
  }, [isLocked, onPendingStateAction]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isLocked) return;

    execute(
      buildUpdateWaitlistItemPayload(
        new FormData(event.currentTarget),
        patient.id,
        version,
        planningStatus,
      ),
    );
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

  const addGuardian = (): void => {
    setGuardianIds((prev) => [...prev, crypto.randomUUID()]);
  };

  const removeGuardian = (id: string): void => {
    setGuardianIds((prev) => prev.filter((existingId) => existingId !== id));
  };

  const card = "bg-primary-50 shadow-soft rounded-2xl p-6";
  const sectionLabel = "text-xs font-bold uppercase tracking-wide text-ink-400";

  return (
    <Form
      id={DETAIL_FORM_ID}
      className="flex flex-col gap-y-10 px-8 py-6"
      errors={fieldErrors}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <section>
          <Heading
            tag="h2"
            className="text-primary-400 flex gap-1.5 font-black uppercase tracking-wider"
          >
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
                options={planningStatusChoices}
                value={planningStatus}
                onValueChange={handlePlanningStatusChange}
                required
              />
            </div>

            <dl className="px-6 flex flex-wrap gap-x-8 gap-y-1 text-sm text-ink-400">
              <div className="flex gap-x-1">
                <dt className="font-semibold">Aangemeld op</dt>
                <dd>{formatDate(registration.createdAt)}</dd>
              </div>
              <div className="flex gap-x-1">
                <dt className="font-semibold">Aangemeld door</dt>
                <dd>{registration.createdBy}</dd>
              </div>
              <div className="flex gap-x-1">
                <dt className="font-semibold">Wachttijd</dt>
                <dd>{formatWaitingTime(waitlistItem.createdAt)}</dd>
              </div>
            </dl>

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
                onValueChange={setIntakeDate}
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
          <Heading
            tag="h2"
            className="text-primary-400 flex gap-1.5 font-black uppercase tracking-wider"
          >
            <span className="text-accent-500">02.</span>Persoonlijke gegevens
          </Heading>

          <div className="mt-4 flex flex-col gap-y-4">
            <p className={sectionLabel}>Patiënt</p>
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

            <p className={sectionLabel}>Ouders</p>
            <div className={card}>
              <div className="flex items-center justify-end mb-2">
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
    </Form>
  );
}
