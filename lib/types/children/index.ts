import { z } from "zod";
import type { RegistrationMethod, WaitlistType } from "@/lib/db/enums";

export const searchChildrenSchema = z.object({
  query: z.string().trim().min(2).max(100),
});

export type ChildSearchResult = {
  readonly patientId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dob: string | null;
  readonly guardianNames: readonly string[];
  readonly takenTypes: readonly WaitlistType[];
  readonly prefill: {
    readonly supportNeed: string;
    readonly registrationMethod: RegistrationMethod;
    readonly additionalNotes: string | null;
  };
};
