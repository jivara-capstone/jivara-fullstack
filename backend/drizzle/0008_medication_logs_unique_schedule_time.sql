WITH ranked_logs AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (
      PARTITION BY schedule_id, scheduled_time
      ORDER BY
        CASE status WHEN 'confirmed' THEN 0 WHEN 'missed' THEN 1 ELSE 2 END,
        confirmed_at DESC NULLS LAST,
        created_at DESC NULLS LAST,
        id DESC
    ) AS duplicate_rank
  FROM medication_logs
)
DELETE FROM medication_logs
WHERE ctid IN (
  SELECT ctid
  FROM ranked_logs
  WHERE duplicate_rank > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_med_logs_schedule_time
ON medication_logs (schedule_id, scheduled_time);
