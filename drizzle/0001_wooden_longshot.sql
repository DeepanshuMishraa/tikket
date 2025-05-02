ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "check_in" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "check_in" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "check_in" ALTER COLUMN "event_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "check_in" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "organiser_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nft_passes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nft_passes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "nft_passes" ALTER COLUMN "event_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nft_passes" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT;