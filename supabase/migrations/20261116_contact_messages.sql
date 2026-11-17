BEGIN;
CREATE TABLE IF NOT EXISTS public."TB_CONTACT_MESSAGES" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
