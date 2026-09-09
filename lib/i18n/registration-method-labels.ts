import type { RegistrationMethod } from "@/lib/db/enums";

export const registrationMethodLabels: Record<RegistrationMethod, string> = {
  mail: "E-mail",
  phone: "Telefoon",
};
