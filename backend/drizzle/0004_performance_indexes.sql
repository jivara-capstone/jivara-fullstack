CREATE INDEX IF NOT EXISTS "idx_patients_org_active_created" ON "patients" ("organization_id", "is_active", "created_at");
CREATE INDEX IF NOT EXISTS "idx_nurses_org_active_created" ON "nurses" ("organization_id", "is_active", "created_at");

CREATE INDEX IF NOT EXISTS "idx_assignments_active_patient" ON "patient_nurse_assignments" ("patient_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_assignments_active_nurse" ON "patient_nurse_assignments" ("nurse_id", "is_active");

CREATE INDEX IF NOT EXISTS "idx_med_sched_patient_active_created" ON "medication_schedules" ("patient_id", "is_active", "created_at");
CREATE INDEX IF NOT EXISTS "idx_med_sched_prescription_active" ON "medication_schedules" ("prescription_id", "is_active");

CREATE INDEX IF NOT EXISTS "idx_med_logs_patient_time" ON "medication_logs" ("patient_id", "scheduled_time");
CREATE INDEX IF NOT EXISTS "idx_med_logs_schedule_time_status" ON "medication_logs" ("schedule_id", "scheduled_time", "status");

CREATE INDEX IF NOT EXISTS "idx_notifications_patient_status_created" ON "notifications" ("patient_id", "status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_med_reminder_jobs_patient_status_updated" ON "medication_reminder_jobs" ("patient_id", "status", "updated_at");

CREATE INDEX IF NOT EXISTS "idx_audit_action_date" ON "audit_logs" ("action", "created_at");
