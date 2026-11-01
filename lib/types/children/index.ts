import { z } from "zod";
import type { WaitlistType } from "@/lib/db/enums";
import type { Person } from "@/lib/types/persons";
import type { Registration } from "@/lib/types/registrations";

export const searchChildrenSchema = z.object({
  query: z.string().trim().min(2).max(100),
});

export type ChildSearchResult = Readonly<
  Pick<Person, "firstName" | "lastName" | "dob">
> & {
  readonly patientId: string;
  readonly guardianNames: readonly string[];
  readonly takenTypes: readonly WaitlistType[];
  readonly prefill: Readonly<
    Pick<Registration, "supportNeed" | "registrationMethod" | "additionalNotes">
  >;
};
