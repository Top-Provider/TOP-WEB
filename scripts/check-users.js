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

async function run() {
  await client.connect();
  const res = await client.query('SELECT id, prefix_th, first_name_th, last_name_th, job_role, badge, sort_order, show_on_home FROM public."TB_USERS" ORDER BY sort_order');
  console.log('TB_USERS records count:', res.rows.length);
  console.log(JSON.stringify(res.rows, null, 2));

  const jobOpts = await client.query("SELECT id, option_type, value, label, display_order FROM public.\"TBM_PROGRAM_OPTIONS\" WHERE option_type = 'job' ORDER BY display_order");
  console.log('Job options count:', jobOpts.rows.length);
  console.log(JSON.stringify(jobOpts.rows, null, 2));

  await client.end();
}

run().catch(console.error);

