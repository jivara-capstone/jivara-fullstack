ALTER TABLE IF EXISTS public.medication_schedules
  DROP CONSTRAINT IF EXISTS medication_schedules_prescription_id_prescriptions_id_fk;

DROP INDEX IF EXISTS public.idx_med_sched_prescription_active;

ALTER TABLE IF EXISTS public.medication_schedules
  DROP COLUMN IF EXISTS prescription_id;

DROP TABLE IF EXISTS public.prescriptions;
