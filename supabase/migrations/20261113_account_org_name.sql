BEGIN;
ALTER TABLE public.admin_accounts
  ADD COLUMN IF NOT EXISTS org_name text;
COMMIT;

