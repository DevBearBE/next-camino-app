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

export function flattenNestedValidationErrors(
  errors: Record<string, unknown>,
): Record<string, string> {
  const result: Record<string, string> = {};

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;

    for (const [key, value] of Object.entries(
      node as Record<string, unknown>,
    )) {
      if (key === "_errors" || !value || typeof value !== "object") continue;

      const messages = (value as { _errors?: string[] })._errors;
      if (Array.isArray(messages) && messages.length > 0) {
        result[key] = messages[0];
      }

      walk(value);
    }
  }

  walk(errors);

  return result;
}
