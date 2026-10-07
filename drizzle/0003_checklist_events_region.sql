ALTER TABLE "checklist_events" ADD COLUMN "region" text;--> statement-breakpoint
UPDATE "checklist_events" SET "region" = CASE WHEN array_length(string_to_array("item_id", ':'), 1) = 3 THEN split_part("item_id", ':', 1) ELSE 'bc' END;--> statement-breakpoint
ALTER TABLE "checklist_events" ALTER COLUMN "region" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "checklist_events_region_idx" ON "checklist_events" USING btree ("region","created_at");
