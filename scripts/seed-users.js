const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await client.connect();
  const check = await client.query('SELECT COUNT(*) FROM public."TB_USERS"');
  if (parseInt(check.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO public."TB_USERS" 
        (prefix_th, first_name_th, last_name_th, position, prefix_en, first_name_en, last_name_en, email, phone, department, is_active)
      VALUES 
        ('นาย', 'สมชาย', 'ใจดี', 'ผู้จัดการฝ่ายเทคโนโลยีสารสนเทศ (IT Manager)', 'Mr.', 'Somchai', 'Jaidee', 'somchai@topprovider.co.th', '02-123-4567', 'แผนกเทคโนโลยีสารสนเทศ', true),
        ('นางสาว', 'ศิริพร', 'ประเสริฐสุข', 'หัวหน้าฝ่ายพัฒนาระบบ (Lead Software Engineer)', 'Ms.', 'Siriporn', 'Prasertsook', 'siriporn@topprovider.co.th', '089-987-6543', 'แผนกวิจัยและพัฒนา', true);
    `);
    console.log('✅ Seeded 2 sample users into TB_USERS');
  } else {
    console.log('ℹ️ TB_USERS already has rows:', check.rows[0].count);
  }

  const res = await client.query('SELECT id, prefix_th, first_name_th, last_name_th, position FROM public."TB_USERS"');
  console.log(res.rows);
  await client.end();
}

seed().catch(err => {
  console.error(err);
  client.end();
});

