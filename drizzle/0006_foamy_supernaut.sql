ALTER TABLE "wallet_details" ADD COLUMN "sol_balance" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "wallet_details" DROP COLUMN "balance";