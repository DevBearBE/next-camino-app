ALTER TABLE "waitlist_items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "waitlist_items_created_at_idx" ON "waitlist_items" ("created_at");--> statement-breakpoint
CREATE INDEX "waitlist_items_contact_status_idx" ON "waitlist_items" ("contact_status");--> statement-breakpoint
CREATE INDEX "waitlist_items_planning_status_idx" ON "waitlist_items" ("planning_status");--> statement-breakpoint
CREATE INDEX "waitlist_items_waitlist_type_idx" ON "waitlist_items" ("waitlist_type");