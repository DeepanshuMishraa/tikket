CREATE TABLE "wallet_details" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"public_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_details" ADD CONSTRAINT "wallet_details_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;