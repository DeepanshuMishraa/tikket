ALTER TABLE "events" ALTER COLUMN "participants_count" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "participants_count" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallet_details" ADD COLUMN "balance" text NOT NULL;