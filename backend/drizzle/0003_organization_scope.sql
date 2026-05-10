CREATE TABLE IF NOT EXISTS "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(256) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "organization_id" uuid;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "organization_id" uuid;
ALTER TABLE "nurses" ADD COLUMN IF NOT EXISTS "organization_id" uuid;

DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "nurses" ADD CONSTRAINT "nurses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "idx_users_organization" ON "users" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_patients_organization" ON "patients" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_nurses_organization" ON "nurses" ("organization_id");
