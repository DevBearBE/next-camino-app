CREATE TYPE "registration_method" AS ENUM('mail', 'phone');--> statement-breakpoint
CREATE TYPE "contact_status" AS ENUM('not_contacted', 'contacted', 'awaiting_info');--> statement-breakpoint
CREATE TYPE "planning_status" AS ENUM('not_planned', 'planned', 'on_hold', 'no_longer_needed');--> statement-breakpoint
CREATE TYPE "waitlist_type" AS ENUM('diagnostics', 'psychological_support', 'child_psychiatric_support');--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"dob" date,
	"tel" text,
	"email" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "registration_guardians" (
	"registration_id" uuid,
	"guardian_id" uuid,
	CONSTRAINT "registration_guardians_pkey" PRIMARY KEY("registration_id","guardian_id")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL UNIQUE,
	"support_need" text NOT NULL,
	"registration_method" "registration_method" NOT NULL,
	"additional_notes" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"registration_id" uuid NOT NULL UNIQUE,
	"waitlist_type" "waitlist_type" NOT NULL,
	"contact_status" "contact_status" DEFAULT 'not_contacted'::"contact_status" NOT NULL,
	"planning_status" "planning_status" DEFAULT 'not_planned'::"planning_status" NOT NULL,
	"intake_at" timestamp,
	"intake_by" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL,
	"updated_at" timestamp,
	"updated_by" text
);
--> statement-breakpoint
CREATE INDEX "registration_guardians_guardian_id_idx" ON "registration_guardians" ("guardian_id");--> statement-breakpoint
ALTER TABLE "registration_guardians" ADD CONSTRAINT "registration_guardians_registration_id_registrations_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registration_guardians" ADD CONSTRAINT "registration_guardians_guardian_id_persons_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "persons"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_patient_id_persons_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "persons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "waitlist_items" ADD CONSTRAINT "waitlist_items_registration_id_registrations_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE;