import { query } from "./db";

export interface PublicCustomer {
  customerId: number;
  customerName: string;
  logoUrl: string | null;
}

let logoColumnReady: Promise<void> | null = null;

export async function ensureHospitalLogoColumn(): Promise<void> {
  if (!logoColumnReady) {
    logoColumnReady = query(
      `ALTER TABLE public."TBM_HD_HOSPITALS" ADD COLUMN IF NOT EXISTS logo_url TEXT`
    )
      .then(() => undefined)
      .catch((err) => {
        logoColumnReady = null;
        throw err;
      });
  }
  return logoColumnReady;
}

export async function listPublicCustomers(): Promise<PublicCustomer[]> {
  await ensureHospitalLogoColumn();
  const result = await query(
    `SELECT id, name,
       CASE WHEN logo_url LIKE 'data:%' THEN '/api/customer-image/' || id ELSE logo_url END AS logo_url
     FROM public."TBM_HD_HOSPITALS"
     WHERE is_active = true
     ORDER BY id ASC`
  );
  return (result.rows as Array<{ id: number | string; name: string; logo_url: string | null }>).map(
    (row) => ({
      customerId: Number(row.id),
      customerName: String(row.name || ""),
      logoUrl: row.logo_url || null,
    })
  );
}
