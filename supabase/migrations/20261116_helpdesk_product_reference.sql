BEGIN;

ALTER TABLE public."TB_HD_TICKETS"
  ADD COLUMN IF NOT EXISTS product_id bigint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'TB_HD_TICKETS_product_id_fkey'
  ) THEN
    ALTER TABLE public."TB_HD_TICKETS"
      ADD CONSTRAINT "TB_HD_TICKETS_product_id_fkey"
      FOREIGN KEY (product_id)
      REFERENCES public."TB_PRODUCTS" (id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "TB_HD_TICKETS_product_id_idx"
  ON public."TB_HD_TICKETS" (product_id);

COMMIT;
