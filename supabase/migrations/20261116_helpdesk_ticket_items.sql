BEGIN;

CREATE TABLE IF NOT EXISTS public."TB_HD_TICKET_ITEMS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id bigint NOT NULL REFERENCES public."TB_HD_TICKETS"(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public."TB_PRODUCTS"(id) ON UPDATE CASCADE ON DELETE SET NULL,
  equipment_type text NOT NULL CHECK (equipment_type IN ('PRINTER', 'COMPUTER', 'NETWORK', 'SOFTWARE', 'OTHER')),
  equipment_brand text,
  equipment_model text,
  serial_number text,
  title text NOT NULL,
  description text,
  is_patient_care_critical boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN (
    'NEW', 'OPEN', 'ASSIGNED', 'IN_PROGRESS',
    'PENDING_CUSTOMER', 'PENDING_PARTS', 'RESOLVED', 'CLOSED', 'CANCELLED'
  )),
  priority text NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
  queue text NOT NULL DEFAULT 'GENERAL' CHECK (queue IN ('PRINTER', 'GENERAL')),
  assigned_to text,
  assigned_phone text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "TB_HD_TICKET_ITEMS_ticket_id_idx"
  ON public."TB_HD_TICKET_ITEMS" (ticket_id, sort_order, id);

ALTER TABLE public."TB_HD_ATTACHMENTS"
  ADD COLUMN IF NOT EXISTS ticket_item_id bigint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TB_HD_ATTACHMENTS_ticket_item_id_fkey'
  ) THEN
    ALTER TABLE public."TB_HD_ATTACHMENTS"
      ADD CONSTRAINT "TB_HD_ATTACHMENTS_ticket_item_id_fkey"
      FOREIGN KEY (ticket_item_id)
      REFERENCES public."TB_HD_TICKET_ITEMS"(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "TB_HD_ATTACHMENTS_ticket_item_id_idx"
  ON public."TB_HD_ATTACHMENTS" (ticket_item_id);

COMMIT;
