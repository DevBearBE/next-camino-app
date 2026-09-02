import { registrationMethodEnum } from "@/lib/db/schemas/registrations";

export const registrationMethodLabels: Record<
  (typeof registrationMethodEnum.enumValues)[number],
  string
> = {
  mail: "E-mail",
  phone: "Telefoon",
};
