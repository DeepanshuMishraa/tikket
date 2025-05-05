ALTER TABLE "events" ADD COLUMN "participants_count" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "participant_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_participant_id_user_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;