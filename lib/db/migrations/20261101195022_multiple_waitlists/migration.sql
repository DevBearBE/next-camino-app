ALTER TABLE "waitlist_items" ADD COLUMN "patient_id" uuid;--> statement-breakpoint
UPDATE "waitlist_items" SET "patient_id" = "registrations"."patient_id" FROM "registrations" WHERE "registrations"."id" = "waitlist_items"."registration_id";--> statement-breakpoint
ALTER TABLE "waitlist_items" ALTER COLUMN "patient_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_id_patient_id_unique" UNIQUE("id","patient_id");--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_patient_id_key";--> statement-breakpoint
CREATE INDEX "registrations_patient_id_idx" ON "registrations" ("patient_id");--> statement-breakpoint
ALTER TABLE "waitlist_items" ADD CONSTRAINT "waitlist_items_patient_id_waitlist_type_unique" UNIQUE("patient_id","waitlist_type");--> statement-breakpoint
ALTER TABLE "waitlist_items" ADD CONSTRAINT "waitlist_items_registration_patient_fkey" FOREIGN KEY ("registration_id","patient_id") REFERENCES "registrations"("id","patient_id") ON DELETE CASCADE;
