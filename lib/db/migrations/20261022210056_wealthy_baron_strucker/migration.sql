UPDATE "waitlist_items" SET "contact_status" = 'contacted' WHERE "contact_status" = 'info_received';--> statement-breakpoint
ALTER TABLE "waitlist_items" ALTER COLUMN "contact_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "waitlist_items" ALTER COLUMN "contact_status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "contact_status";--> statement-breakpoint
CREATE TYPE "contact_status" AS ENUM('not_contacted', 'awaiting_info', 'contacted');--> statement-breakpoint
ALTER TABLE "waitlist_items" ALTER COLUMN "contact_status" SET DATA TYPE "contact_status" USING "contact_status"::"contact_status";--> statement-breakpoint
ALTER TABLE "waitlist_items" ALTER COLUMN "contact_status" SET DEFAULT 'not_contacted'::"contact_status";