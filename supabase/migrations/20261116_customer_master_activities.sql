BEGIN;

-- Reuse the hospital directory as the shared customer master so Helpdesk and
-- Activities always reference the same list.
CREATE TABLE IF NOT EXISTS public."TBM_HD_HOSPITALS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public."TB_ACTIVITIES"
  ADD COLUMN IF NOT EXISTS customer_id bigint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'TB_ACTIVITIES_customer_id_fkey'
  ) THEN
    ALTER TABLE public."TB_ACTIVITIES"
      ADD CONSTRAINT "TB_ACTIVITIES_customer_id_fkey"
      FOREIGN KEY (customer_id)
      REFERENCES public."TBM_HD_HOSPITALS" (id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "TB_ACTIVITIES_customer_id_idx"
  ON public."TB_ACTIVITIES" (customer_id);

COMMIT;
