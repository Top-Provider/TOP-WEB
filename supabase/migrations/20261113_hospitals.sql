BEGIN;

CREATE TABLE IF NOT EXISTS public."TBM_HD_HOSPITALS" (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public."TBM_HD_HOSPITALS" (name)
SELECT DISTINCT trim(org_name)
FROM public.admin_accounts
WHERE org_name IS NOT NULL AND trim(org_name) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public."TBM_HD_HOSPITALS" (name)
SELECT DISTINCT trim(customer_org)
FROM public."TB_HD_TICKETS"
WHERE customer_org IS NOT NULL AND trim(customer_org) <> ''
ON CONFLICT (name) DO NOTHING;

COMMIT;

