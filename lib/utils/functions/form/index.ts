import { SelectOption } from "@/components/atoms/form/select";
import { registrationMethodEnum } from "@/lib/db/schemas/registrations";
import { waitlistTypeEnum } from "@/lib/db/schemas/waitlist-items";
import { registrationMethodLabels } from "@/lib/i18n/registration-method-labels";
import { waitlistTypeLabels } from "@/lib/i18n/waitlist-type-labels";

export const registrationMethodOptions: SelectOption[] =
  registrationMethodEnum.enumValues.map((value) => ({
    value,
    label: registrationMethodLabels[value],
  }));

export const waitlistTypeOptions: SelectOption[] =
  waitlistTypeEnum.enumValues.map((value) => ({
    value,
    label: waitlistTypeLabels[value],
  }));

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
