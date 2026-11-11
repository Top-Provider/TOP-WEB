const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value.trim();
    }
  }
}

const connectionString = process.env.DATABASE_URL;
const client = new Client({ connectionString });

const jobOptions = [
  { value: 'CEO', label: 'CEO - ประธานเจ้าหน้าที่บริหาร (Chief Executive Officer)', order: 1 },
  { value: 'MD', label: 'MD - กรรมการผู้จัดการ (Managing Director)', order: 2 },
  { value: 'CIO', label: 'CIO - ประธานเจ้าหน้าที่ฝ่ายสารสนเทศ (Chief Information Officer)', order: 3 },
  { value: 'CFO', label: 'CFO - ประธานเจ้าหน้าที่ฝ่ายการเงิน (Chief Financial Officer)', order: 4 },
  { value: 'CTO', label: 'CTO - ประธานเจ้าหน้าที่ฝ่ายเทคโนโลยี (Chief Technology Officer)', order: 5 },
  { value: 'COO', label: 'COO - ประธานเจ้าหน้าที่ฝ่ายปฏิบัติการ (Chief Operating Officer)', order: 6 },
  { value: 'VP', label: 'VP - รองกรรมการผู้จัดการ / รองประธาน (Vice President)', order: 7 },
  { value: 'DEV', label: 'DEV - นักพัฒนาระบบ (Software Developer / Engineer)', order: 8 },
  { value: 'IMP', label: 'IMP - ผู้เชี่ยวชาญการติดตั้งระบบ (System Implementer)', order: 9 },
  { value: 'เซลล์', label: 'เซลล์ - ฝ่ายขายและการตลาด (Sales & Marketing)', order: 10 },
  { value: 'จัดซื้อ', label: 'จัดซื้อ - ฝ่ายจัดซื้อและพัสดุ (Procurement & Purchasing)', order: 11 },
  { value: 'hr', label: 'HR - ฝ่ายทรัพยากรบุคคล (Human Resources)', order: 12 },
  { value: 'บัญชี', label: 'บัญชี - ฝ่ายบัญชีและการเงิน (Accounting & Finance)', order: 13 },
];

async function run() {
  await client.connect();
  console.log('✅ Connected to database');

  let insertedCount = 0;
  for (const item of jobOptions) {
    // Check if exists
    const check = await client.query(
      `SELECT id FROM public."TBM_PROGRAM_OPTIONS" WHERE option_type = 'job' AND value = $1`,
      [item.value]
    );

    if (check.rows.length === 0) {
      await client.query(
        `INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
         VALUES ('job', $1, $2, $3, true)`,
        [item.value, item.label, item.order]
      );
      insertedCount++;
      console.log(`✅ Added: ${item.value} (${item.label})`);
    } else {
      await client.query(
        `UPDATE public."TBM_PROGRAM_OPTIONS" 
         SET label = $1, display_order = $2, is_active = true, updated_at = now()
         WHERE id = $3`,
        [item.label, item.order, check.rows[0].id]
      );
      console.log(`🔄 Updated: ${item.value}`);
    }
  }

  // Count total job options in DB
  const res = await client.query(
    `SELECT id, option_type, value, label, display_order FROM public."TBM_PROGRAM_OPTIONS" WHERE option_type = 'job' ORDER BY display_order ASC`
  );

  console.log(`\n🎉 Total 'job' options in TBM_PROGRAM_OPTIONS: ${res.rows.length} rows`);
  console.table(res.rows);

  // Also update backups/TBM_PROGRAM_OPTIONS.json
  const allOptionsRes = await client.query(
    `SELECT * FROM public."TBM_PROGRAM_OPTIONS" ORDER BY id ASC`
  );
  const backupPath = path.resolve(__dirname, '../backups/TBM_PROGRAM_OPTIONS.json');
  fs.writeFileSync(backupPath, JSON.stringify(allOptionsRes.rows, null, 2), 'utf8');
  console.log(`💾 Updated backup file: backups/TBM_PROGRAM_OPTIONS.json (${allOptionsRes.rows.length} total options)`);

  await client.end();
}

run().catch(err => {
  console.error('❌ Error adding job options:', err);
  client.end();
  process.exit(1);
});

