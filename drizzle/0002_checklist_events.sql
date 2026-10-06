CREATE TABLE "checklist_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"item_id" text NOT NULL,
	"done" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checklist_events" ADD CONSTRAINT "checklist_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checklist_events_created_idx" ON "checklist_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "checklist_events_item_idx" ON "checklist_events" USING btree ("item_id");