import { defineRelations } from "drizzle-orm";
import { personsTable } from "@/lib/db/schemas/persons";
import { registrationsTable } from "@/lib/db/schemas/registrations";
import { registrationGuardiansTable } from "@/lib/db/schemas/registration-guardians";
import { waitlistItemsTable } from "@/lib/db/schemas/waitlist-items";

const schema = {
  personsTable,
  registrationsTable,
  registrationGuardiansTable,
  waitlistItemsTable,
};

export const relations = defineRelations(schema, (relation) => ({
  personsTable: {
    patientRegistration: relation.one.registrationsTable({
      from: relation.personsTable.id,
      to: relation.registrationsTable.patientId,
    }),
  },
  registrationsTable: {
    patient: relation.one.personsTable({
      from: relation.registrationsTable.patientId,
      to: relation.personsTable.id,
    }),
    guardians: relation.many.personsTable({
      from: relation.registrationsTable.id.through(
        relation.registrationGuardiansTable.registrationId,
      ),
      to: relation.personsTable.id.through(
        relation.registrationGuardiansTable.guardianId,
      ),
    }),
    waitlistItem: relation.one.waitlistItemsTable({
      from: relation.registrationsTable.id,
      to: relation.waitlistItemsTable.registrationId,
    }),
  },
  waitlistItemsTable: {
    registration: relation.one.registrationsTable({
      from: relation.waitlistItemsTable.registrationId,
      to: relation.registrationsTable.id,
    }),
  },
}));
