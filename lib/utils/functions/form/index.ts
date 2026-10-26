import type { SelectOption } from "@/components/atoms/form/select";
import {
  contactStatusValues,
  planningStatusValues,
  registrationMethodValues,
  waitlistTypeValues,
} from "@/lib/db/enums";
import { contactStatusLabels } from "@/lib/i18n/contact-status-labels";
import { planningStatusLabels } from "@/lib/i18n/planning-status-labels";
import { registrationMethodLabels } from "@/lib/i18n/registration-method-labels";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";

export const registrationMethodOptions: SelectOption[] =
  registrationMethodValues.map((value) => ({
    value,
    label: registrationMethodLabels[value],
  }));

export const waitlistTypeOptions: SelectOption[] = waitlistTypeValues.map(
  (value) => ({
    value,
    label: waitlistTypeLabels[value],
  }),
);

export const contactStatusOptions: SelectOption[] = contactStatusValues.map(
  (value) => ({
    value,
    label: contactStatusLabels[value],
  }),
);

export const planningStatusOptions: SelectOption[] = planningStatusValues.map(
  (value) => ({
    value,
    label: planningStatusLabels[value],
  }),
);

type ValidationErrorNode = { _errors?: string[]; [key: string]: unknown };

function collectFieldErrors(node: unknown): [string, string][] {
  if (!node || typeof node !== "object") return [];

  return Object.entries(node as Record<string, unknown>).flatMap(
    ([key, value]) => {
      if (key === "_errors" || !value || typeof value !== "object") return [];

      const messages = (value as ValidationErrorNode)._errors;
      const ownError: [string, string][] =
        Array.isArray(messages) && messages.length > 0
          ? [[key, messages[0]]]
          : [];

      return [...ownError, ...collectFieldErrors(value)];
    },
  );
}

export function flattenNestedValidationErrors(
  errors: ValidationErrorNode,
): Record<string, string> {
  return Object.fromEntries(collectFieldErrors(errors));
}
