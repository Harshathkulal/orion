ALTER TABLE "documents" RENAME COLUMN "uploaded_at" TO "created_at";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "type" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "type" SET DEFAULT 'text';--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "jwks" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
CREATE INDEX "conversations_user_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id");