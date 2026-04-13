CREATE TABLE "balance_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"balance_type" text NOT NULL,
	"running_balance" integer NOT NULL,
	"description" text,
	"payment_id" text,
	"payout_id" text,
	"dm_access_id" text,
	"created_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"subject" text,
	"dm_access_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"creator_replied" boolean DEFAULT false,
	"creator_replied_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_balance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"available_balance" integer DEFAULT 0 NOT NULL,
	"pending_balance" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_withdrawn" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	CONSTRAINT "creator_balance_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_payout_method" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"method_type" text NOT NULL,
	"display_name" text,
	"bank_account_number" text,
	"bank_routing_number" text,
	"bank_iban" text,
	"bank_ifsc" text,
	"bank_swift" text,
	"bank_name" text,
	"account_holder_name" text,
	"paypal_email" text,
	"upi_id" text,
	"is_verified" boolean DEFAULT false,
	"is_primary" boolean DEFAULT false,
	"country" text,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dm_access" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"amount_paid" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_id" text,
	"guaranteed_reply_fulfilled" boolean DEFAULT false,
	"guaranteed_reply_fulfilled_at" timestamp (6) with time zone,
	"expires_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider" text NOT NULL,
	"provider_payment_id" text,
	"provider_checkout_url" text,
	"provider_checkout_id" text,
	"refunded_at" timestamp (6) with time zone,
	"refund_reason" text,
	"metadata" json,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"payout_method_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"fee" integer DEFAULT 0,
	"net_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider" text,
	"provider_payout_id" text,
	"provider_response" json,
	"failure_reason" text,
	"processed_at" timestamp (6) with time zone,
	"completed_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refund_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"fan_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"message_id" text,
	"type" text DEFAULT 'goodwill' NOT NULL,
	"note" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_payment_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"active_provider" text,
	"dodo_business_id" text,
	"dodo_onboarded" boolean DEFAULT false,
	"dodo_onboarded_at" timestamp (6) with time zone,
	"stripe_account_id" text,
	"stripe_onboarded" boolean DEFAULT false,
	"stripe_onboarded_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	CONSTRAINT "user_payment_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "niche" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dm_price" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "guaranteed_reply_price" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_twitter" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_twitter_audience" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_instagram" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_instagram_audience" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_youtube" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_youtube_audience" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "follower_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "balance_transaction" ADD CONSTRAINT "balance_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transaction" ADD CONSTRAINT "balance_transaction_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transaction" ADD CONSTRAINT "balance_transaction_payout_id_payout_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transaction" ADD CONSTRAINT "balance_transaction_dm_access_id_dm_access_id_fk" FOREIGN KEY ("dm_access_id") REFERENCES "public"."dm_access"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_dm_access_id_dm_access_id_fk" FOREIGN KEY ("dm_access_id") REFERENCES "public"."dm_access"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_balance" ADD CONSTRAINT "creator_balance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payout_method" ADD CONSTRAINT "creator_payout_method_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dm_access" ADD CONSTRAINT "dm_access_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dm_access" ADD CONSTRAINT "dm_access_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dm_access" ADD CONSTRAINT "dm_access_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_payout_method_id_creator_payout_method_id_fk" FOREIGN KEY ("payout_method_id") REFERENCES "public"."creator_payout_method"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_analytics" ADD CONSTRAINT "refund_analytics_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_analytics" ADD CONSTRAINT "refund_analytics_fan_id_user_id_fk" FOREIGN KEY ("fan_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_analytics" ADD CONSTRAINT "refund_analytics_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_settings" ADD CONSTRAINT "user_payment_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");