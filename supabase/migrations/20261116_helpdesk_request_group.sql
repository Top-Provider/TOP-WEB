BEGIN;
ALTER TABLE public."TB_HD_TICKETS"
  ADD COLUMN IF NOT EXISTS request_group_no text,
  ADD COLUMN IF NOT EXISTS product_id bigint;
CREATE INDEX IF NOT EXISTS idx_hd_tickets_request_group
  ON public."TB_HD_TICKETS"(request_group_no);
COMMIT;
