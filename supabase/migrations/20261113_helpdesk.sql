-- Helpdesk & SLA System (Phase 1)
-- Single SLA policy, Business Hours Mon-Fri 08:30-18:00, Printer + General queues.
BEGIN;

CREATE TABLE IF NOT EXISTS public."TBM_HD_SLA_TARGETS" (
  priority text PRIMARY KEY CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
  label text NOT NULL,
  first_response_minutes integer NOT NULL CHECK (first_response_minutes > 0),
  onsite_minutes integer CHECK (onsite_minutes IS NULL OR onsite_minutes > 0),
  resolve_minutes integer NOT NULL CHECK (resolve_minutes > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public."TBM_HD_SLA_TARGETS" (priority, label, first_response_minutes, onsite_minutes, resolve_minutes)
VALUES
  ('P1', 'วิกฤต (Critical)', 30, 240, 480),
  ('P2', 'เร่งด่วน (High)', 60, 570, 1140),
  ('P3', 'ปกติ (Medium)', 240, 1140, 2850),
  ('P4', 'ไม่เร่งด่วน (Low)', 570, NULL, 5700)
ON CONFLICT (priority) DO NOTHING;

CREATE TABLE IF NOT EXISTS public."TBM_HD_BUSINESS_HOURS" (
  day_of_week integer PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  day_name text NOT NULL,
  is_working_day boolean NOT NULL DEFAULT true,
  start_time text NOT NULL DEFAULT '08:30',
  end_time text NOT NULL DEFAULT '18:00',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public."TBM_HD_BUSINESS_HOURS" (day_of_week, day_name, is_working_day, start_time, end_time)
VALUES
  (0, 'อาทิตย์', false, '08:30', '18:00'),
  (1, 'จันทร์', true, '08:30', '18:00'),
  (2, 'อังคาร', true, '08:30', '18:00'),
  (3, 'พุธ', true, '08:30', '18:00'),
  (4, 'พฤหัสบดี', true, '08:30', '18:00'),
  (5, 'ศุกร์', true, '08:30', '18:00'),
  (6, 'เสาร์', false, '08:30', '18:00')
ON CONFLICT (day_of_week) DO NOTHING;

CREATE TABLE IF NOT EXISTS public."TBM_HD_HOLIDAYS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  holiday_date date NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."TB_HD_TICKETS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_no text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN (
    'NEW', 'OPEN', 'ASSIGNED', 'IN_PROGRESS',
    'PENDING_CUSTOMER', 'PENDING_PARTS', 'RESOLVED', 'CLOSED', 'CANCELLED'
  )),
  priority text NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
  impact text NOT NULL DEFAULT 'USER' CHECK (impact IN ('ORG', 'DEPT', 'USER')),
  urgency text NOT NULL DEFAULT 'NORMAL' CHECK (urgency IN ('CRITICAL', 'HIGH', 'NORMAL')),
  queue text NOT NULL DEFAULT 'GENERAL' CHECK (queue IN ('PRINTER', 'GENERAL')),
  source_channel text NOT NULL DEFAULT 'WEB' CHECK (source_channel IN ('WEB', 'LINE_GROUP', 'PHONE', 'QR', 'WALK_IN')),
  customer_org text NOT NULL,
  customer_dept text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_line text,
  equipment_type text NOT NULL DEFAULT 'PRINTER' CHECK (equipment_type IN ('PRINTER', 'COMPUTER', 'NETWORK', 'SOFTWARE', 'OTHER')),
  equipment_brand text,
  equipment_model text,
  serial_number text,
  title text NOT NULL,
  description text,
  is_patient_care_critical boolean NOT NULL DEFAULT false,
  assigned_to text,
  assigned_phone text,
  scheduled_at timestamptz,
  sla_started_at timestamptz NOT NULL,
  first_response_due_at timestamptz NOT NULL,
  onsite_due_at timestamptz,
  resolve_due_at timestamptz NOT NULL,
  first_responded_at timestamptz,
  onsite_arrived_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  sla_paused_at timestamptz,
  sla_paused_minutes integer NOT NULL DEFAULT 0,
  sla_breached boolean NOT NULL DEFAULT false,
  csat_score integer CHECK (csat_score IS NULL OR (csat_score BETWEEN 1 AND 5)),
  csat_comment text,
  created_by text NOT NULL DEFAULT 'CUSTOMER',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hd_tickets_status ON public."TB_HD_TICKETS"(status);
CREATE INDEX IF NOT EXISTS idx_hd_tickets_queue ON public."TB_HD_TICKETS"(queue);
CREATE INDEX IF NOT EXISTS idx_hd_tickets_priority ON public."TB_HD_TICKETS"(priority);
CREATE INDEX IF NOT EXISTS idx_hd_tickets_created_at ON public."TB_HD_TICKETS"(created_at DESC);

CREATE TABLE IF NOT EXISTS public."TB_HD_MESSAGES" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id bigint NOT NULL REFERENCES public."TB_HD_TICKETS"(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('CUSTOMER', 'STAFF', 'SYSTEM')),
  sender_name text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hd_messages_ticket ON public."TB_HD_MESSAGES"(ticket_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public."TB_HD_ATTACHMENTS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id bigint NOT NULL REFERENCES public."TB_HD_TICKETS"(id) ON DELETE CASCADE,
  stage text NOT NULL DEFAULT 'REPORT' CHECK (stage IN ('REPORT', 'BEFORE', 'AFTER', 'OTHER')),
  file_name text NOT NULL,
  data_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hd_attachments_ticket ON public."TB_HD_ATTACHMENTS"(ticket_id);

CREATE TABLE IF NOT EXISTS public."TB_HD_EVENTS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id bigint NOT NULL REFERENCES public."TB_HD_TICKETS"(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor text NOT NULL,
  from_value text,
  to_value text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hd_events_ticket ON public."TB_HD_EVENTS"(ticket_id, created_at ASC);

COMMIT;

