BEGIN;

ALTER TABLE public."TB_HD_TICKETS"
  ADD COLUMN IF NOT EXISTS client_request_id uuid,
  ADD COLUMN IF NOT EXISTS request_item_index integer,
  ADD COLUMN IF NOT EXISTS resolution_summary text,
  ADD COLUMN IF NOT EXISTS root_cause text,
  ADD COLUMN IF NOT EXISTS parts_used text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_hd_tickets_client_request_item
  ON public."TB_HD_TICKETS"(client_request_id, request_item_index)
  WHERE client_request_id IS NOT NULL;

COMMIT;
