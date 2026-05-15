CREATE TABLE IF NOT EXISTS "activity_reads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "activity_id" varchar(128) NOT NULL,
  "read_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_activity_reads_user" ON "activity_reads" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_activity_reads_user_activity" ON "activity_reads" ("user_id", "activity_id");
