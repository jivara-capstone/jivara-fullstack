ALTER TABLE "medication_schedules"
ADD COLUMN IF NOT EXISTS "reminder_enabled" boolean DEFAULT true;
