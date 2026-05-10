ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_status" varchar(20) NOT NULL DEFAULT 'active';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "approved_by" uuid;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "approved_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rejected_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rejected_reason" text;

CREATE INDEX IF NOT EXISTS "idx_users_account_status" ON "users" ("account_status");
